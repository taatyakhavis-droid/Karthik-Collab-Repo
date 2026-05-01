import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { postService } from '../../../services/postService';
import profileImage from 'figma:asset/49c8ccba36a51569e9a90564ca0d93176f42feae.png';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../../utils/cropImage';

export default function App() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Digital Theory');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'public' | 'draft'>('public');
  const [image, setImage] = useState('');
  const [imagePosition, setImagePosition] = useState('50% 50%');
  const [categories, setCategories] = useState<string[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  
  const [newCat, setNewCat] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Cropper State
  const [uploadedImage, setUploadedImage] = useState('');
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    const cats = postService.getCategories();
    setCategories(cats);
    setAllPosts(postService.getPosts());
    if (id) {
      const existingPost = postService.getPostById(id);
      if (existingPost) {
        setTitle(existingPost.title);
        setCategory(existingPost.category);
        setContent(existingPost.content || '');
        setStatus(existingPost.status);
        setImage(existingPost.image);
        setImagePosition(existingPost.imagePosition || '50% 50%');
        if (editorRef.current) {
          editorRef.current.innerHTML = existingPost.content || '';
        }
      }
    } else {
      if (cats.length > 0) setCategory(cats[0]);
    }
  }, [id]);

  const handlePublish = () => {
    const editorContent = editorRef.current?.innerHTML || '';
    const newOrSaved = postService.savePost({
      id,
      title,
      category,
      content: editorContent,
      status,
      image: image || 'https://images.unsplash.com/photo-1518005020951-eccb494ad742',
      imagePosition,
      author: { name: 'Admin', avatar: profileImage },
    });
    alert('Archive Record Saved');
    navigate('/admin/' + newOrSaved.id);
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('PERMANENTLY PURGE RECORD?')) {
      postService.deletePost(postId);
      setAllPosts(postService.getPosts());
      if (postId === id) {
        navigate('/admin');
      }
    }
  };

  const handleAddCategory = () => {
    if (newCat.trim()) {
      const updated = postService.addCategory(newCat.trim());
      setCategories(updated);
      setNewCat('');
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (window.confirm(`Permanently remove category "${cat}"?`)) {
      const updated = postService.deleteCategory(cat);
      setCategories(updated);
      if (category === cat && updated.length > 0) {
        setCategory(updated[0]);
      }
    }
  };

  const formatText = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt('Enter hyperlink URL:');
    if (url) {
      formatText('createLink', url);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setUploadedImage(reader.result?.toString() || '');
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    try {
      const croppedImage = await getCroppedImg(uploadedImage, croppedAreaPixels);
      setImage(croppedImage);
      setIsCropping(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pt-20 relative overflow-x-hidden">
      <header className="fixed top-0 flex justify-between items-center w-full px-6 py-4 bg-[#0e0e0e]/80 backdrop-blur-xl z-50 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setIsMenuOpen(true)}
            className="group flex flex-col gap-1.5 cursor-pointer p-2 hover:scale-110 transition-transform"
          >
            <div className="w-8 h-0.5 bg-[#FBDE06] group-hover:w-6 transition-all"></div>
            <div className="w-6 h-0.5 bg-[#FBDE06] group-hover:w-8 transition-all"></div>
            <div className="w-4 h-0.5 bg-[#FBDE06] group-hover:w-8 transition-all"></div>
          </div>
          <Link to="/">
            <h1 className="font-['Archivo_Black'] tracking-tighter uppercase font-black text-[#FBDE06] tracking-[-0.02em]" style={{ fontSize: '24px' }}>THE ARCHIVE</h1>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8">
            <Link className="text-gray-400 font-bold hover:text-[#FBDE06] transition-colors duration-300" to="/">HOME</Link>
            <Link className="text-[#FBDE06] font-bold" to="/admin">DASHBOARD</Link>
          </nav>
        </div>
      </header>

      {/* Modern Navigation Drawer */}
      <div 
        className={`fixed inset-0 z-[100] transition-all duration-700 ${isMenuOpen ? 'visible' : 'invisible'}`}
      >
        <div 
          className={`absolute inset-0 bg-[#0e0e0e]/40 backdrop-blur-xl transition-opacity duration-700 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        <div 
          className={`absolute top-0 left-0 h-full w-full md:w-[480px] bg-[#1a1a1a] shadow-[20px_0_100px_rgba(0,0,0,0.8)] p-12 flex flex-col transition-transform duration-700 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-archivo text-[#FBDE06] text-2xl uppercase">Settings Drawer</h2>
            <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center text-[#FBDE06] hover:scale-110 transition-transform">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-12">
            <nav className="flex flex-col gap-6">
              <Link to="/" className="text-4xl font-archivo text-white hover:text-[#FBDE06] transition-colors duration-300">HOME (LIVE SITE)</Link>
              <Link to="/admin" className="text-4xl font-archivo text-[#FBDE06] transition-colors duration-300">ADMIN PORTAL</Link>
              <button onClick={handleLogout} className="text-left text-4xl font-archivo text-red-500 hover:text-red-400 transition-colors">LOGOUT</button>
            </nav>

            <section className="pt-12 border-t border-[#262626]">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-6 block">Quick Nav to Vibe</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => (
                  <Link 
                    key={cat}
                    to="/"
                    className="px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all text-left text-gray-400 neumorphic-flat hover:text-[#FBDE06]"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="pt-12 border-t border-[#262626] flex items-center justify-between">
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-[#FBDE06] transition-colors">
                <i className="fa-brands fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-500 hover:text-[#FBDE06] transition-colors">
                 <i className="fa-brands fa-x-twitter text-xl"></i>
              </a>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-800">Admin Console v2.0</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-24 md:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 mb-4">
          <h2 className="font-['Archivo_Black'] tracking-tighter uppercase leading-none mb-2" style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}>
            ADMIN <span className="text-[#FBDE06]">CONSOLE</span>
          </h2>
          <p className="text-[#adaaaa] tracking-wide uppercase opacity-70" style={{ fontSize: '12px', fontWeight: 500 }}>Editorial Management System v2.0</p>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <section className="neumorphic-flat p-8 rounded-[2rem] border-0">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="uppercase font-bold tracking-[0.2em] text-[#FBDE06] ml-2" style={{ fontSize: '10px' }}>Post Title</label>
                <input
                  className="w-full bg-transparent neumorphic-inset rounded-xl px-6 py-4 border-0 focus:ring-1 focus:ring-[#FBDE06]/40 text-white placeholder:text-gray-600 font-['Archivo_Black'] uppercase"
                  placeholder="Enter a monumental headline..."
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ fontSize: '20px' }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="uppercase font-bold tracking-[0.2em] text-[#FBDE06] ml-2" style={{ fontSize: '10px' }}>Category</label>
                  <div className="relative">
                    <select 
                      className="w-full appearance-none bg-transparent neumorphic-inset rounded-xl px-6 py-4 border-0 focus:ring-1 focus:ring-[#FBDE06]/40 text-[#adaaaa]"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      {!categories.length && <option>Digital Theory</option>}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">expand_more</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="uppercase font-bold tracking-[0.2em] text-[#FBDE06] ml-2" style={{ fontSize: '10px' }}>Visibility</label>
                  <div className="flex gap-2 p-1 neumorphic-inset rounded-xl h-[56px] items-center px-2">
                    <button 
                      onClick={() => setStatus('public')}
                      className={`flex-1 py-2 px-4 rounded-lg font-bold uppercase tracking-wider text-[12px] ${status === 'public' ? 'bg-[#FBDE06] text-[#0e0e0e]' : 'text-gray-500'}`}
                    >
                      Public
                    </button>
                    <button 
                      onClick={() => setStatus('draft')}
                      className={`flex-1 py-2 px-4 rounded-lg font-bold uppercase tracking-wider text-[12px] ${status === 'draft' ? 'bg-[#FBDE06] text-[#0e0e0e]' : 'text-gray-500'}`}
                    >
                      Draft
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center overflow-x-auto no-scrollbar gap-4">
                  <label className="uppercase font-bold tracking-[0.2em] text-[#FBDE06] ml-2 shrink-0" style={{ fontSize: '10px' }}>Cover Image Upload</label>
                  <div className="flex items-center gap-2 shrink-0">
                    <select 
                      className="appearance-none bg-transparent neumorphic-inset rounded-lg px-4 py-2 border-0 focus:ring-1 focus:ring-[#FBDE06]/40 text-[#adaaaa] text-xs uppercase cursor-pointer h-[32px]"
                      value={imagePosition}
                      onChange={(e) => setImagePosition(e.target.value)}
                    >
                      <option value="top">Position: Top</option>
                      <option value="center">Position: Center</option>
                      <option value="bottom">Position: Bottom</option>
                      <option value="50% 50%">Position: 50% 50%</option>
                    </select>
                    <label className="bg-transparent neumorphic-flat rounded-lg px-4 border-0 text-[#FBDE06] font-bold uppercase tracking-wider text-xs cursor-pointer hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 h-[32px]">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload</span>
                      Device
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8">
                    <input
                      className="w-full h-full bg-transparent neumorphic-inset rounded-xl px-6 py-4 border-0 focus:ring-1 focus:ring-[#FBDE06]/40 text-white placeholder:text-gray-600"
                      placeholder="Or paste high-res image URL..."
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                  </div>
                  <div 
                    onClick={() => { if(image) { setUploadedImage(image); setIsCropping(true); } }}
                    className={`md:col-span-4 h-[56px] rounded-xl overflow-hidden neumorphic-inset relative group transition-all ${image ? 'cursor-pointer hover:scale-[1.05] active:scale-95' : ''}`}
                  >
                    {image ? (
                      <>
                        <img src={image} className="w-full h-full object-cover transition-transform group-hover:scale-110" style={{ objectPosition: imagePosition }} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#FBDE06] text-sm">crop</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px] uppercase font-bold tracking-widest">No Image</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="uppercase font-bold tracking-[0.2em] text-[#FBDE06] ml-2" style={{ fontSize: '10px' }}>Body Content</label>
                <div className="neumorphic-flat rounded-[1.5rem] overflow-hidden">
                  <div className="flex items-center gap-2 p-4 bg-[#262626] border-b border-[#0a0a0a]">
                    <button onClick={() => formatText('bold')} className="p-2 neumorphic-flat rounded-lg hover:text-[#FBDE06] transition-colors">
                      <span className="material-symbols-outlined">format_bold</span>
                    </button>
                    <button onClick={() => formatText('italic')} className="p-2 neumorphic-flat rounded-lg hover:text-[#FBDE06] transition-colors">
                      <span className="material-symbols-outlined">format_italic</span>
                    </button>
                    <button onClick={() => formatText('insertUnorderedList')} className="p-2 neumorphic-flat rounded-lg hover:text-[#FBDE06] transition-colors">
                      <span className="material-symbols-outlined">format_list_bulleted</span>
                    </button>
                    <div className="w-[1px] h-6 bg-gray-800 mx-1"></div>
                    <button onClick={handleLink} className="p-2 neumorphic-flat rounded-lg hover:text-[#FBDE06] transition-colors">
                      <span className="material-symbols-outlined">link</span>
                    </button>
                    <button onClick={() => document.documentElement.requestFullscreen()} className="p-2 neumorphic-flat rounded-lg hover:text-[#FBDE06] transition-colors ml-auto">
                      <span className="material-symbols-outlined">fullscreen</span>
                    </button>
                  </div>
                  <div 
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => setContent(e.currentTarget.innerHTML)}
                    className="w-full min-h-[300px] bg-transparent border-0 focus:ring-0 px-8 py-6 text-white leading-relaxed outline-none"
                    style={{ fontSize: '18px' }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-4 mt-6 border-t border-[#1a1a1a] pt-6">
                {id && (
                  <button 
                    onClick={() => handleDeletePost(id)}
                    className="px-6 py-4 rounded-xl font-bold uppercase tracking-[0.1em] text-[#ff7351] neumorphic-inset hover:bg-black transition-all mr-auto"
                  >
                    Delete Post
                  </button>
                )}
                <button className="px-8 py-4 rounded-xl font-bold uppercase tracking-[0.1em] text-gray-400 neumorphic-flat active:shadow-[inset_4px_4px_8px_#0a0a0a,inset_-4px_-4px_8px_#1a1a1a] transition-all">
                  Preview
                </button>
                <button 
                  onClick={handlePublish}
                  className="px-8 py-4 rounded-xl font-bold uppercase tracking-[0.1em] bg-[#20201f] text-[#FBDE06] neumorphic-flat hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">publish</span>
                  Publish Post
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="neumorphic-flat p-8 rounded-[2rem]">
            <h3 className="font-['Archivo_Black'] tracking-tight uppercase mb-6 flex items-center justify-between" style={{ fontSize: '20px' }}>
              Archive Log
              <Link to="/admin" className="w-8 h-8 rounded-full neumorphic-flat flex items-center justify-center text-[#FBDE06] hover:scale-110 transition-transform">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
              </Link>
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
              {allPosts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 neumorphic-inset rounded-xl">
                  <span className="font-bold tracking-wide text-white truncate pr-2 max-w-[180px]" style={{ fontSize: '14px' }}>{p.title}</span>
                  <div className="flex gap-2">
                    <Link to={`/admin/${p.id}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#FBDE06] transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                    </Link>
                    <button onClick={() => handleDeletePost(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#ff7351] transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                    </button>
                  </div>
                </div>
              ))}
              {allPosts.length === 0 && (
                 <p className="text-gray-500 text-xs uppercase tracking-widest text-center py-4">No records found</p>
              )}
            </div>
          </section>
          
          <section className="neumorphic-flat p-8 rounded-[2rem]">
            <h3 className="font-['Archivo_Black'] tracking-tight uppercase mb-6" style={{ fontSize: '20px' }}>Categories</h3>
            <div className="space-y-4">
              {categories.map(c => (
                <div key={c} className="flex items-center justify-between p-4 neumorphic-inset rounded-xl">
                  <span className="font-bold tracking-wide text-white truncate pr-2 max-w-[180px]" style={{ fontSize: '14px' }}>{c}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteCategory(c)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#ff7351] transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-2 border-t border-[#1a1a1a] pt-6">
              <label className="uppercase font-bold tracking-[0.2em] text-[#FBDE06] ml-2" style={{ fontSize: '10px' }}>Add Category</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-transparent neumorphic-inset rounded-xl px-4 py-3 border-0 focus:ring-1 focus:ring-[#FBDE06]/40 text-white placeholder:text-gray-600"
                  placeholder="New..."
                  type="text"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  style={{ fontSize: '12px' }}
                />
                <button onClick={handleAddCategory} className="px-6 neumorphic-flat rounded-xl text-[#FBDE06] font-bold uppercase transition-transform hover:scale-105 active:scale-95" style={{ fontSize: '12px' }}>Add</button>
              </div>
            </div>
          </section>

          <section className="neumorphic-flat p-8 rounded-[2rem]">
            <h3 className="font-['Archivo_Black'] tracking-tight uppercase mb-6" style={{ fontSize: '20px' }}>Archive Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="neumorphic-inset p-4 rounded-2xl flex flex-col items-center">
                <span className="font-['Archivo_Black'] text-[#FBDE06]" style={{ fontSize: '24px' }}>{allPosts.filter(p => p.status !== 'draft').length}</span>
                <span className="font-bold uppercase tracking-widest text-gray-500" style={{ fontSize: '10px' }}>Live Posts</span>
              </div>
              <div className="neumorphic-inset p-4 rounded-2xl flex flex-col items-center">
                <span className="font-['Archivo_Black'] text-white" style={{ fontSize: '24px' }}>{allPosts.filter(p => p.status === 'draft').length}</span>
                <span className="font-bold uppercase tracking-widest text-gray-500" style={{ fontSize: '10px' }}>Drafts</span>
              </div>
            </div>
            <div className="mt-6 p-4 neumorphic-inset rounded-2xl bg-[#131313]">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold uppercase tracking-widest text-gray-500" style={{ fontSize: '10px' }}>Server Health</span>
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              </div>
              <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div className="bg-[#FBDE06] h-full w-[85%]"></div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {isCropping && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
          <div className="absolute top-8 text-center w-full">
             <h2 className="text-[#FBDE06] font-['Archivo_Black'] text-3xl uppercase tracking-tighter">Precision Framing</h2>
             <p className="text-gray-500 uppercase tracking-widest text-xs mt-2">Pinch, zoom, and drag to frame your cinematic cover.</p>
          </div>
          
          <div className="relative w-full max-w-5xl h-[60vh] neumorphic-inset rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <Cropper
              image={uploadedImage}
              crop={crop}
              zoom={zoom}
              aspect={21 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
            />
          </div>
          
          <div className="mt-12 flex gap-4 w-full max-w-xl items-center bg-[#131313] p-4 rounded-2xl neumorphic-inset">
            <span className="material-symbols-outlined text-gray-500">zoom_out</span>
            <input 
              type="range" 
              value={zoom} 
              min={1} 
              max={3} 
              step={0.01} 
              onChange={(e) => setZoom(Number(e.target.value))} 
              className="flex-1 accent-[#FBDE06] bg-[#262626] rounded-full appearance-none h-2"
            />
             <span className="material-symbols-outlined text-gray-500">zoom_in</span>
          </div>
          
          <div className="mt-8 flex gap-6">
            <button onClick={() => setIsCropping(false)} className="px-10 py-5 rounded-2xl font-bold uppercase tracking-[0.1em] text-gray-500 neumorphic-flat active:scale-95 transition-all">Cancel</button>
            <button onClick={handleCropSave} className="px-12 py-5 rounded-2xl font-black uppercase tracking-[0.1em] bg-[#FBDE06] text-[#0e0e0e] neumorphic-flat hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(251,222,6,0.2)]">Commit Frame</button>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-around items-center max-w-md mx-auto bg-[#20201f]/60 backdrop-blur-2xl rounded-[2rem] px-8 py-3 shadow-[5px_5px_10px_#0a0a0a,-5px_-5px_10px_#1a1a1a] w-[90%]">
        <Link to="/" className="text-gray-500 p-3 hover:scale-110 transition-transform duration-200">
          <span className="material-symbols-outlined">home</span>
        </Link>
        <div className="text-gray-500 p-3 hover:scale-110 transition-transform duration-200">
          <span className="material-symbols-outlined">explore</span>
        </div>
        <Link to="/admin" className="text-gray-500 p-3 hover:scale-110 transition-transform duration-200">
          <span className="material-symbols-outlined">add_circle</span>
        </Link>
        <Link to="/admin" className="text-[#FBDE06] shadow-[inset_4px_4px_8px_#0a0a0a,inset_-4px_-4px_8px_#1a1a1a] p-3 rounded-full bg-[#20201f]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
        </Link>
      </nav>

      <button 
        onClick={handlePublish}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#FBDE06] text-[#0e0e0e] shadow-[0px_10px_20px_rgba(251,222,6,0.3)] flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined font-bold" style={{ fontSize: '30px' }}>save</span>
      </button>
    </div>
  );
}