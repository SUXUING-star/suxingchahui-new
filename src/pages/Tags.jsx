// src/pages/Tags.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tag as TagIcon } from 'lucide-react';
import { getTagsData } from '../utils/postUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PostCard from '../components/common/PostCard'; // <-- 统一复用
import anime from 'animejs';

function Tags() {
    const [tags, setTags] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const tagsRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
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
            } catch (error) {
                console.error("Error fetching tag data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [location.hash]);

    useEffect(() => {
        if (!loading && tagsRef.current) {
            anime({ targets: '.tag-cloud-btn', scale: [0.5, 1], opacity: [0, 1], delay: anime.stagger(50), duration: 600, easing: 'easeOutBack' });
        }
    }, [loading]);

    const handleTagClick = (tag) => {
        const newTag = selectedTag === tag ? null : tag;
        setSelectedTag(newTag);
        navigate(newTag ? `#${encodeURIComponent(newTag)}` : location.pathname, { replace: true });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* 标签云 */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12" ref={tagsRef}>
                {Object.entries(tags).map(([tag, posts]) => (
                    <button 
                        key={tag} 
                        onClick={() => handleTagClick(tag)} 
                        className={`tag-cloud-btn inline-flex items-center rounded-full px-5 py-2.5 transition-all shadow-sm ${selectedTag === tag ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:shadow-md'}`}
                    >
                        <TagIcon size={16} className="mr-2" />
                        <span className="font-bold">{tag}</span>
                        <span className="ml-2 text-xs opacity-60">{posts.length}</span>
                    </button>
                ))}
            </div>

            {selectedTag && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center space-x-4 px-4">
                        <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                            标签：{selectedTag}
                        </h2>
                    </div>
                    {/* 核心改动：统一布局 */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                        {tags[selectedTag]?.map(post => (
                            <div key={post.id} className="w-full max-w-sm">
                                <PostCard post={post} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tags;