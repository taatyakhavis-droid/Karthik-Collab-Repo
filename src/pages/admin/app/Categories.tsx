import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../../../services/postService';
import { authService } from '../../../services/authService';

// ─── Panel is OUTSIDE the parent component so it is NEVER recreated
// on each keystroke. If it were defined inside, React would treat it
// as a new component type on every render, unmounting the input and
// causing focus loss.
interface PanelProps {
  title: string;
  items: string[];
  newValue: string;
  onNewChange: (v: string) => void;
  onAdd: () => void;
  onDelete: (name: string) => void;
  addLoading: boolean;
  error: string;
  placeholder: string;
  isTag?: boolean;
}

function Panel({ title, items, newValue, onNewChange, onAdd, onDelete, addLoading, error, placeholder, isTag }: PanelProps) {
  return (
    <section className="neumorphic-flat p-8 rounded-[2rem]">
      <h3 className="font-archivo uppercase tracking-tight text-lg mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-[#FBDE06] text-sm">{isTag ? 'label' : 'folder'}</span>
        {title}
        <span className="text-gray-600 text-sm font-normal normal-case tracking-normal ml-auto">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </h3>

      <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
        {items.length === 0 && (
          <p className="text-gray-600 text-xs uppercase tracking-widest text-center py-6">
            No {title.toLowerCase()} yet.
          </p>
        )}
        {items.map(item => (
          <div key={item} className="flex items-center justify-between p-4 neumorphic-inset rounded-xl">
            <span className="font-bold tracking-wide text-white text-sm">
              {isTag ? `#${item}` : item}
            </span>
            <button
              onClick={() => onDelete(item)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#ff7351] transition-colors"
              aria-label={`Delete ${item}`}
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-[#1a1a1a] pt-6 space-y-3">
        <label className="uppercase font-bold tracking-[0.2em] text-[#FBDE06] ml-2 text-[10px]">Add New</label>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-transparent neumorphic-inset rounded-xl px-4 py-3 border-0 focus:ring-1 focus:ring-[#FBDE06]/40 text-white placeholder:text-gray-600 text-sm outline-none"
            placeholder={placeholder}
            value={newValue}
            onChange={e => onNewChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !addLoading && newValue.trim() && onAdd()}
          />
          <button
            onClick={onAdd}
            disabled={addLoading || !newValue.trim()}
            className="px-6 neumorphic-flat rounded-xl text-[#FBDE06] font-bold uppercase text-xs hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
          >
            {addLoading ? '...' : 'Add'}
          </button>
        </div>
        {error && <p className="text-red-400 text-[10px] ml-2">{error}</p>}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
export default function Categories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newCat, setNewCat] = useState('');
  const [newTag, setNewTag] = useState('');
  const [catError, setCatError] = useState('');
  const [tagError, setTagError] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [tagLoading, setTagLoading] = useState(false);

  const fetchAll = async () => {
    const [cats, tgs] = await Promise.all([postService.getCategories(), postService.getTags()]);
    setCategories(cats);
    setTags(tgs);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    setCatLoading(true);
    setCatError('');
    try {
      await postService.addCategory(newCat.trim());
      setNewCat('');
      await fetchAll();
    } catch (e: any) {
      setCatError(e.message?.includes('unique') ? 'Category already exists.' : e.message || 'Failed to add.');
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (name: string) => {
    if (!window.confirm(`Delete category "${name}"? Existing posts keep their value.`)) return;
    await postService.deleteCategory(name);
    await fetchAll();
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    setTagLoading(true);
    setTagError('');
    try {
      await postService.addTag(newTag.trim());
      setNewTag('');
      await fetchAll();
    } catch (e: any) {
      setTagError(e.message?.includes('unique') ? 'Tag already exists.' : e.message || 'Failed to add.');
    } finally {
      setTagLoading(false);
    }
  };

  const handleDeleteTag = async (name: string) => {
    if (!window.confirm(`Delete tag "${name}"? Existing posts keep their value.`)) return;
    await postService.deleteTag(name);
    await fetchAll();
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      {/* ── Header ── */}
      <header className="fixed top-0 flex justify-between items-center w-full px-6 py-4 bg-[#0e0e0e]/80 backdrop-blur-xl z-50 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <Link
          to="/admin"
          className="text-gray-400 hover:text-[#FBDE06] transition-colors flex items-center gap-2 text-xs uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Dashboard
        </Link>
        <Link to="/" className="font-archivo tracking-[-0.02em] uppercase text-[#FBDE06] hidden md:block" style={{ fontSize: '20px' }}>
          THE ARCHIVE
        </Link>
        <button
          onClick={() => authService.logout()}
          className="text-gray-400 hover:text-red-400 transition-colors text-xs uppercase tracking-widest font-bold"
        >
          Logout
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h2 className="font-archivo tracking-tighter uppercase leading-none" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
            CATEGORIES <span className="text-[#FBDE06]">&</span> TAGS
          </h2>
          <p className="text-[#adaaaa] text-xs uppercase tracking-widest mt-2">Manage taxonomy for your posts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Panel
            title="Categories"
            items={categories}
            newValue={newCat}
            onNewChange={v => { setNewCat(v); setCatError(''); }}
            onAdd={handleAddCategory}
            onDelete={handleDeleteCategory}
            addLoading={catLoading}
            error={catError}
            placeholder="e.g. Digital Theory"
          />
          <Panel
            title="Tags"
            items={tags}
            newValue={newTag}
            onNewChange={v => { setNewTag(v); setTagError(''); }}
            onAdd={handleAddTag}
            onDelete={handleDeleteTag}
            addLoading={tagLoading}
            error={tagError}
            placeholder="e.g. architecture"
            isTag
          />
        </div>

        <div className="mt-8 p-6 neumorphic-flat rounded-2xl">
          <p className="text-[#adaaaa] text-xs uppercase tracking-widest text-center">
            Deleting a category or tag won't affect existing posts — they'll retain their current values.
          </p>
        </div>
      </main>
    </div>
  );
}
