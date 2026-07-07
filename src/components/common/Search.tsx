import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, X as CloseIcon, Loader2 } from "lucide-react";
import _ from "lodash";
import { apiSearchPosts } from "../../utils/postApi";
import { PostResponse } from "../../models/PostResponse";
import { animate, stagger } from "animejs";

const Search: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = useCallback(
    _.debounce(async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await apiSearchPosts(term);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500),
    [],
  );

  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm, performSearch]);

  // 面板打开入场动画
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      animate(dropdownRef.current, {
        opacity: [0, 1],
        scale: [0.96, 1],
        translateY: [-12, 0],
        duration: 400,
        ease: "outQuart",
      });
    }
  }, [isOpen]);

  // 搜索结果 Stagger 交错淡入动画
  useEffect(() => {
    if (isOpen) {
      const targets = document.querySelectorAll(".search-item-animate");
      if (targets.length > 0) {
        animate(targets, {
          opacity: [0, 1],
          translateY: [8, 0],
          delay: stagger(40),
          duration: 300,
          ease: "outQuad",
        });
      }
    }
  }, [searchResults, isOpen, searchTerm, loading]);

  const highlightText = (text: string, term: string): React.ReactNode => {
    if (!term.trim() || !text) return text;
    const regex = new RegExp(`(${_.escapeRegExp(term)})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white rounded-sm px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <div className="relative" ref={searchRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
      >
        <SearchIcon size={20} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          // 💡 视觉统一改动：背景调整为 bg-white/80 dark:bg-gray-900/90，边框调整为 border-white/20 dark:border-white/5，圆角统一为 sm:rounded-[24px]
          className="fixed inset-0 sm:inset-auto sm:absolute sm:right-0 mt-0 sm:mt-2 w-full sm:w-96 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl sm:rounded-[24px] shadow-2xl shadow-black/5 z-50 border border-white/20 dark:border-white/5 overflow-hidden opacity-0"
        >
          {/* 输入框边框在暗色模式下也略微淡化以适应磨砂背景 */}
          <div className="flex items-center gap-2 p-4 border-b border-gray-100 dark:border-white/5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="搜索内容..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="w-full pl-4 pr-10 py-2 bg-gray-50/50 dark:bg-gray-900/50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none dark:text-white font-medium"
                autoFocus
              />
              {loading && (
                <Loader2
                  className="absolute right-3 top-2.5 animate-spin text-blue-500"
                  size={18}
                />
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto p-2">
            {searchResults.map((post) => (
              <button
                key={post.id}
                onClick={() => {
                  navigate(`/post/${post.id}`);
                  setIsOpen(false);
                }}
                className="search-item-animate opacity-0 w-full text-left p-3 hover:bg-white/50 dark:hover:bg-gray-800/30 rounded-xl transition-colors group"
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                  {highlightText(post.title, searchTerm)}
                </div>
                {post.category && (
                  <div className="text-xs text-gray-500 mt-1">
                    分类：{post.category}
                  </div>
                )}
                <div className="flex gap-1 mt-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 bg-gray-100/50 dark:bg-gray-900/50 rounded-full text-gray-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}

            {searchTerm && !loading && searchResults.length === 0 && (
              <div className="search-item-animate opacity-0 py-10 text-center text-gray-500 text-sm">
                找不到相关文章 ¯\_(ツ)_/¯
              </div>
            )}

            {!searchTerm && (
              <div className="search-item-animate opacity-0 py-10 text-center text-gray-400 text-sm italic">
                输入搜索关键词...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
