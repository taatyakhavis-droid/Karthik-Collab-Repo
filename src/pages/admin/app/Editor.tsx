import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { postService, sanitizeHtml } from '../../../services/postService';
import { authService } from '../../../services/authService';
import { slugify } from '../../../utils/slugify';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../../utils/cropImage';

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export default function Editor() {
  const { slug: editSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(editSlug);
  const editorRef = useRef<HTMLDivElement>(null);

  const [postId, setPostId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'public' | 'draft'>('draft');
  const [coverImage, setCoverImage] = useState('');
  const [imagePosition, setImagePosition] = useState('50% 50%');
  const [categories, setCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState('');
  const [slugWarning, setSlugWarning] = useState(false);

  // Cropper state
  const [uploadedImage, setUploadedImage] = useState('');
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Inline image insertion state
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [inlineImageUrl, setInlineImageUrl] = useState('');
  const savedSelection = useRef<Range | null>(null);

  useEffect(() => {
    Promise.all([postService.getCategories(), postService.getTags()])
      .then(([cats, tags]) => {
        setCategories(cats);
        setAvailableTags(tags);
        if (!isEditing && cats.length > 0) setCategory(cats[0]);
      });

    if (editSlug) {
      postService.getAdminPostBySlug(editSlug).then(post => {
        if (!post) { navigate('/console'); return; }
        setPostId(post.id);
        setTitle(post.title);
        setSlug(post.slug);
        setSlugManuallyEdited(true); // treat as manually set when editing
        setShortDescription(post.short_description);
        setCategory(post.category);
        setSelectedTags(post.tags || []);
        setStatus(post.status);
        setCoverImage(post.cover_image);
        setImagePosition(post.image_position);
        if (editorRef.current) editorRef.current.innerHTML = sanitizeHtml(post.content || '');
      });
    }
  }, [editSlug]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  const handleSlugChange = (val: string) => {
    setSlugManuallyEdited(true);
    setSlug(slugify(val));
    if (isEditing) setSlugWarning(true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSave = async () => {
    if (!title.trim()) { setSaveError('Title is required.'); return; }
    if (!slug.trim()) { setSaveError('Slug is required.'); return; }
    setSaveStatus('saving');
    setSaveError('');
    try {
      const content = editorRef.current?.innerHTML || '';
      await postService.savePost({
        id: postId || undefined,
        title,
        slug,
        short_description: shortDescription,
        content,
        cover_image: coverImage,
        image_position: imagePosition,
        category,
        status,
        tags: selectedTags,
        author_name: 'Admin',
        published_at: null,
      });
      // Always redirect to dashboard after save
      navigate('/console');
    } catch (e: any) {
      setSaveStatus('error');
      setSaveError(e.message || 'Save failed. The slug may already be taken.');
    }
  };

  const handleDelete = async () => {
    if (!postId) return;
    if (!window.confirm(`Permanently delete "${title}"?`)) return;
    await postService.deletePost(postId);
    navigate('/console');
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  // ── Cursor-position helpers for inline image insertion ──
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (savedSelection.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
    }
  };

  const insertImageAtCursor = (src: string) => {
    restoreSelection();
    document.execCommand(
      'insertHTML', false,
      `<img src="${src}" alt="Inline image" style="max-width:100%;border-radius:12px;margin:1.5rem auto;display:block;" />`
    );
    setShowImagePanel(false);
    setInlineImageUrl('');
  };

  const handleShowImagePanel = () => {
    saveSelection();
    setShowImagePanel(prev => !prev);
  };

  const handleInsertImageUrl = () => {
    if (!inlineImageUrl.trim()) return;
    insertImageAtCursor(inlineImageUrl.trim());
  };

  const handleInlineImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be under 2 MB.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        insertImageAtCursor(reader.result?.toString() || '');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) formatText('createLink', url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('Cover image must be under 2 MB.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setUploadedImage(reader.result?.toString() || '');
        setIsCropping(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropSave = async () => {
    try {
      const cropped = await getCroppedImg(uploadedImage, croppedAreaPixels);
      setCoverImage(cropped);
      setIsCropping(false);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white pb-24 md:pb-0">
      {/* Header */}
      <header className="fixed top-0 flex justify-between items-center w-full px-6 py-4 bg-[#0e0e0e]/80 backdrop-blur-xl z-50 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-4">
          <Link to="/console" className="text-gray-400 hover:text-[#FBDE06] transition-colors flex items-center gap-2 text-xs uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/console" className="font-archivo tracking-[-0.02em] uppercase text-[#FBDE06] hidden md:block" style={{ fontSize: '20px' }}>mostlyindia.in</Link>
          <Link to="/console/categories" className="text-gray-400 hover:text-[#FBDE06] text-xs uppercase tracking-widest hidden md:block">Categories & Tags</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24 md:pt-28">
        <div className="mb-6">
          <h2 className="font-archivo tracking-tighter uppercase leading-none" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
            {isEditing ? 'EDIT POST' : 'NEW POST'}
          </h2>
        </div>

        {/* Save feedback */}
        {saveStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest">Post saved successfully!</p>
          </div>
        )}
        {(saveStatus === 'error' || saveError) && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-red-400 text-sm">error</span>
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{saveError || 'Save failed.'}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── LEFT: Main Editor ── */}
          <div className="lg:col-span-8 space-y-6">
            <section className="neumorphic-flat p-8 rounded-[2rem] space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="uppercase font-bold tracking-[0.2em] text-[#FBDE06] ml-2 text-[10px]">Post Title</label>
                <input
                  className="w-full bg-transparent neumorphic-inset rounded-xl px-6 py-4 border-0 focus:ring-1 focus:ring-[#FBDE06]/40 text-white placeholder:text-gray-600 font-archivo uppercase"
                  placeholder="Enter a headline..."
                  value={title} onChange={e => setTitle(e.target.value)}
                  style={{ fontSize: '20px' }}
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="uppercase font-bold tracking-[0.2em] text-[#FBDE06] ml-2 text-[10px]">URL Slug</label>
                <input
                  className="w-full bg-transparent neumorphic-inset rounded-xl px-6 py-3 border-0 focus:ring-1 focus:ring-[#FBDE06]/40 text-[#adaaaa] placeholder:text-gray-600 font-mono text-sm"
                  placeholder="auto-generated-from-title"
                  value={slug}
                  onChange={e => handleSlugChange(e.target.value)}
                />
                <p className="text-[#adaaaa] text-[10px] ml-2 font-mono">/blog/<span className="text-[#FBDE06]">{slug || 'your-slug'}</span></p>
                {slugWarning && (
                  <p className="text-amber-400 text-[10px] ml-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">warning</span>
                    Changing the slug will break existing links to this post.
                  </p>
                )}
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <label className="uppercase font-bold tracking-[0.2em] text-[#FBDE06] ml-2 text-[10px]">Short Description <span className="text-gray-500 normal-case tracking-normal font-normal">({shortDescription.length}/160)</span></label>
                <textarea
                  className="w-full bg-transparent neumorphic-inset rounded-xl px-6 py-4 border-0 focus:ring-1 focus:ring-[#FBDE06]/40 text-white placeholder:text-gray-600 resize-none"
                  placeholder="A short teaser shown on the homepage card..."
                  rows={3} maxLength={160}
                  value={shortDescription} onChange={e => setShortDescription(e.target.value)}
                />
              </div>

              {/* Body Content Editor */}
              <div className="space-y-2">
                <label className="uppercase font-bold tracking-[0.2em] text-[#FBDE06] ml-2 text-[10px]">Body Content</label>
                <div className="neumorphic-flat rounded-[1.5rem] overflow-hidden">
                  <div className="flex items-center gap-2 p-4 bg-[#262626] border-b border-[#0a0a0a] flex-wrap">
                    {[
                      { cmd: 'bold', icon: 'format_bold' },
                      { cmd: 'italic', icon: 'format_italic' },
                      { cmd: 'insertUnorderedList', icon: 'format_list_bulleted' },
                      { cmd: 'insertOrderedList', icon: 'format_list_numbered' },
                    ].map(({ cmd, icon }) => (
                      <button key={cmd} onClick={() => formatText(cmd)} className="p-2 neumorphic-flat rounded-lg hover:text-[#FBDE06] transition-colors">
                        <span className="material-symbols-outlined">{icon}</span>
                      </button>
                    ))}
                    <div className="w-[1px] h-6 bg-gray-800 mx-1" />
                    <button onClick={handleLink} className="p-2 neumorphic-flat rounded-lg hover:text-[#FBDE06] transition-colors">
                      <span className="material-symbols-outlined">link</span>
                    </button>
                    <button
                      onClick={handleShowImagePanel}
                      className={`p-2 neumorphic-flat rounded-lg transition-colors ${showImagePanel ? 'text-[#FBDE06] bg-[#0a0a0a]' : 'hover:text-[#FBDE06]'}`}
                      title="Insert image"
                    >
                      <span className="material-symbols-outlined">image</span>
                    </button>
                    <button onClick={() => document.documentElement.requestFullscreen()} className="p-2 neumorphic-flat rounded-lg hover:text-[#FBDE06] transition-colors ml-auto">
                      <span className="material-symbols-outlined">fullscreen</span>
                    </button>
                  </div>

                  {/* Inline Image Panel */}
                  {showImagePanel && (
                    <div className="p-4 bg-[#1a1a1a] border-b border-[#0a0a0a] space-y-3 animate-in slide-in-from-top duration-200">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FBDE06]">Insert Image into Content</p>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 bg-[#131313] rounded-lg px-3 py-2 border border-[#262626] focus:border-[#FBDE06]/40 text-white placeholder:text-gray-600 text-sm outline-none transition-colors"
                          placeholder="Paste image URL here..."
                          value={inlineImageUrl}
                          onChange={e => setInlineImageUrl(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleInsertImageUrl()}
                          autoFocus
                        />
                        <button
                          onClick={handleInsertImageUrl}
                          disabled={!inlineImageUrl.trim()}
                          className="px-5 py-2 bg-[#FBDE06] text-[#0e0e0e] rounded-lg font-black uppercase text-xs disabled:opacity-40 hover:scale-105 active:scale-95 transition-transform"
                        >
                          Insert
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-[#262626]" />
                        <span className="text-gray-600 text-xs uppercase tracking-widest">or upload</span>
                        <div className="flex-1 h-px bg-[#262626]" />
                      </div>
                      <label className="flex items-center justify-center gap-2 p-3 rounded-lg neumorphic-flat cursor-pointer text-gray-400 hover:text-[#FBDE06] transition-colors text-xs uppercase tracking-widest font-bold">
                        <span className="material-symbols-outlined text-sm">upload_file</span>
                        Upload from device
                        <input type="file" accept="image/*" className="hidden" onChange={handleInlineImageUpload} />
                      </label>
                    </div>
                  )}

                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full min-h-[300px] bg-transparent border-0 focus:ring-0 px-8 py-6 text-white leading-relaxed outline-none"
                    style={{ fontSize: '18px' }}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* ── RIGHT: Settings ── */}
          <div className="lg:col-span-4 space-y-6">
            {/* Cover Image */}
            <section className="neumorphic-flat p-6 rounded-[2rem] space-y-4">
              <h3 className="font-archivo uppercase tracking-tight text-sm text-[#FBDE06]">Cover Image</h3>
              <div className="flex items-center gap-2">
                <select
                  className="appearance-none bg-transparent neumorphic-inset rounded-lg px-3 py-2 border-0 text-[#adaaaa] text-xs uppercase cursor-pointer flex-1"
                  value={imagePosition} onChange={e => setImagePosition(e.target.value)}
                >
                  <option value="top">Position: Top</option>
                  <option value="center">Position: Center</option>
                  <option value="bottom">Position: Bottom</option>
                  <option value="50% 50%">Position: 50%</option>
                </select>
                <label className="bg-transparent neumorphic-flat rounded-lg px-3 py-2 text-[#FBDE06] font-bold uppercase tracking-wider text-xs cursor-pointer hover:scale-105 transition-transform flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              <input
                className="w-full bg-transparent neumorphic-inset rounded-xl px-4 py-3 border-0 focus:ring-1 focus:ring-[#FBDE06]/40 text-white placeholder:text-gray-600 text-sm"
                placeholder="Or paste image URL..."
                value={coverImage} onChange={e => setCoverImage(e.target.value)}
              />
              {coverImage && (
                <div
                  onClick={() => { setUploadedImage(coverImage); setIsCropping(true); }}
                  className="h-32 rounded-xl overflow-hidden neumorphic-inset cursor-pointer group relative"
                >
                  <img src={coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform" style={{ objectPosition: imagePosition }} alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#FBDE06]">crop</span>
                  </div>
                </div>
              )}
            </section>

            {/* Category */}
            <section className="neumorphic-flat p-6 rounded-[2rem] space-y-4">
              <h3 className="font-archivo uppercase tracking-tight text-sm text-[#FBDE06]">Category</h3>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-transparent neumorphic-inset rounded-xl px-4 py-3 border-0 focus:ring-1 focus:ring-[#FBDE06]/40 text-[#adaaaa] text-sm cursor-pointer"
                  value={category} onChange={e => setCategory(e.target.value)}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  {!categories.length && <option>Uncategorized</option>}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-sm">expand_more</span>
              </div>
            </section>

            {/* Tags */}
            <section className="neumorphic-flat p-6 rounded-[2rem] space-y-4">
              <h3 className="font-archivo uppercase tracking-tight text-sm text-[#FBDE06]">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${selectedTags.includes(tag) ? 'bg-[#FBDE06] text-[#0e0e0e]' : 'neumorphic-flat text-gray-400 hover:text-white'}`}
                  >
                    #{tag}
                  </button>
                ))}
                {!availableTags.length && (
                  <Link to="/console/categories" className="text-[#adaaaa] text-xs">Add tags in Categories & Tags →</Link>
                )}
              </div>
            </section>

            {/* Visibility */}
            <section className="neumorphic-flat p-6 rounded-[2rem] space-y-4">
              <h3 className="font-archivo uppercase tracking-tight text-sm text-[#FBDE06]">Visibility</h3>
              <div className="flex gap-2 p-1 neumorphic-inset rounded-xl h-[52px] items-center px-2">
                {(['public', 'draft'] as const).map(s => (
                  <button key={s} onClick={() => setStatus(s)} className={`flex-1 py-2 px-4 rounded-lg font-bold uppercase tracking-wider text-xs ${status === s ? 'bg-[#FBDE06] text-[#0e0e0e]' : 'text-gray-500'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {/* Actions */}
            <section className="space-y-3">
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="w-full py-4 rounded-xl font-black uppercase tracking-[0.1em] bg-[#FBDE06] text-[#0e0e0e] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-sm">{saveStatus === 'saving' ? 'hourglass_empty' : 'publish'}</span>
                {saveStatus === 'saving' ? 'Saving...' : 'Save Post'}
              </button>

              {isEditing && (
                <div className="flex gap-3">
                  <Link
                    to={`/blog/${slug}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-xs neumorphic-flat text-gray-400 hover:text-[#FBDE06] transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span> Preview
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-xs neumorphic-flat text-[#ff7351] hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span> Delete
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Mobile FAB */}
      <button
        onClick={handleSave}
        disabled={saveStatus === 'saving'}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#FBDE06] text-[#0e0e0e] shadow-[0px_10px_20px_rgba(251,222,6,0.3)] flex items-center justify-center z-40 active:scale-90 transition-transform disabled:opacity-60"
      >
        <span className="material-symbols-outlined font-bold" style={{ fontSize: '28px' }}>save</span>
      </button>

      {/* Image Cropper Modal */}
      {isCropping && (
        <div className="fixed inset-0 z-[200] bg-black/98 flex flex-col items-center justify-center p-8">
          <div className="absolute top-8 text-center w-full">
            <h2 className="text-[#FBDE06] font-archivo text-3xl uppercase tracking-tighter">Precision Framing</h2>
            <p className="text-gray-500 uppercase tracking-widest text-xs mt-2">Drag & zoom to frame your cover.</p>
          </div>
          <div className="relative w-full max-w-5xl h-[60vh] neumorphic-inset rounded-[2rem] overflow-hidden">
            <Cropper image={uploadedImage} crop={crop} zoom={zoom} aspect={21 / 9}
              onCropChange={setCrop} onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            />
          </div>
          <div className="mt-10 flex gap-4 w-full max-w-xl items-center bg-[#131313] p-4 rounded-2xl neumorphic-inset">
            <span className="material-symbols-outlined text-gray-500">zoom_out</span>
            <input type="range" value={zoom} min={1} max={3} step={0.01}
              onChange={e => setZoom(Number(e.target.value))}
              className="flex-1 accent-[#FBDE06]"
            />
            <span className="material-symbols-outlined text-gray-500">zoom_in</span>
          </div>
          <div className="mt-8 flex gap-6">
            <button onClick={() => setIsCropping(false)} className="px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-gray-500 neumorphic-flat">Cancel</button>
            <button onClick={handleCropSave} className="px-12 py-4 rounded-2xl font-black uppercase tracking-widest bg-[#FBDE06] text-[#0e0e0e] hover:scale-[1.02] transition-all">Commit Frame</button>
          </div>
        </div>
      )}
    </div>
  );
}
