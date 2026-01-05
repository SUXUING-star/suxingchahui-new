// src/pages/Tags.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tag as TagIcon } from 'lucide-react';
import { getTagsData } from '../utils/postUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusPlaceholder from '../components/common/StatusPlaceholder';
import PostCard from '../components/common/PostCard';
import anime from 'animejs';

function Tags() {
    const [tags, setTags] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const isInitialized = useRef(false);

    const fetchTags = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const posts = await getTagsData();
            const tagMap = {};
            posts.forEach(post => {
                post.tags.forEach(tag => {
                    if (!tagMap[tag]) tagMap[tag] = [];
                    tagMap[tag].push(post);
                });
            });
            setTags(tagMap);
            const hashTag = decodeURIComponent(location.hash.slice(1));
            if (hashTag && tagMap[hashTag]) setSelectedTag(hashTag);
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [location.hash]);

    useEffect(() => {
        if (!isInitialized.current) {
            fetchTags();
            isInitialized.current = true;
        }
    }, [fetchTags]);

    useEffect(() => {
        if (!loading && Object.keys(tags).length > 0) {
            anime({ targets: '.tag-btn-animate', scale: [0.8, 1], opacity: [0, 1], delay: anime.stagger(30), duration: 600, easing: 'easeOutBack' });
        }
    }, [loading, tags]);

    const handleTagClick = (tag) => {
        const newTag = selectedTag === tag ? null : tag;
        setSelectedTag(newTag);
        navigate(newTag ? `#${encodeURIComponent(newTag)}` : location.pathname, { replace: true });
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <StatusPlaceholder type="error" title="标签云坍塌" onRetry={fetchTags} />;
    if (Object.keys(tags).length === 0) return <StatusPlaceholder type="empty" title="暂无标签" onRetry={fetchTags} />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
                {Object.entries(tags).map(([tag, posts]) => (
                    <button 
                        key={tag} 
                        onClick={() => handleTagClick(tag)} 
                        className={`tag-btn-animate inline-flex items-center rounded-2xl px-6 py-3 transition-all shadow-md font-black text-sm uppercase tracking-widest ${selectedTag === tag ? 'bg-blue-600 text-white scale-110 shadow-blue-500/40' : 'bg-white/80 dark:bg-gray-800 text-gray-500 backdrop-blur-md border border-white/20'}`}
                    >
                        <TagIcon size={16} className="mr-2" />
                        {tag} <span className="ml-2 opacity-40 text-[10px]">{posts.length}</span>
                    </button>
                ))}
            </div>

            {selectedTag && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="inline-flex items-center space-x-6 px-8 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-full border border-white/20">
                        <div className="h-2 w-10 bg-blue-600 rounded-full"></div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase">
                            TAG: {selectedTag}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 justify-items-center">
                        {tags[selectedTag]?.map(post => <PostCard key={post.id} post={post} />)}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tags;