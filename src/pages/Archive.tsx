import React, { useState, useEffect, useCallback } from "react";
import { getArchive } from "../utils/postApi";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import StatusPlaceholder from "../components/common/StatusPlaceholder";
import PostCard from "../components/post/PostCard";
// 1. 具名引入 animate 和 stagger
import { animate, stagger } from "animejs";
import { PostResponse } from "../models/PostResponse";

type ArchiveData = Record<string, Record<string, PostResponse[]>>;

const Archive: React.FC = () => {
  const [archiveData, setArchiveData] = useState<ArchiveData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchArchive = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const posts = await getArchive();
      const grouped = posts.reduce((acc: ArchiveData, post) => {
        const date = new Date(post.createTime);
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString();
        if (!acc[year]) acc[year] = {};
        if (!acc[year][month]) acc[year][month] = [];
        acc[year][month].push(post);
        return acc;
      }, {});
      setArchiveData(grouped);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchive();
  }, [fetchArchive]);

  useEffect(() => {
    if (!loading && Object.keys(archiveData).length > 0) {
      // 2. 更改为 v4 的 animate 写法，并使用 stagger 和 ease 参数名
      animate(".archive-animate", {
        translateY: [30, 0],
        opacity: [0, 1],
        delay: stagger(100),
        duration: 800,
        ease: "outExpo",
      });
    }
  }, [loading, archiveData]);

  if (loading) return <LoadingSpinner />;
  if (error) return <StatusPlaceholder type="error" onRetry={fetchArchive} />;
  if (Object.keys(archiveData).length === 0)
    return <StatusPlaceholder type="empty" onRetry={fetchArchive} />;

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-8 sm:py-12">
      <div className="space-y-16 sm:space-y-24">
        {Object.entries(archiveData)
          .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
          .map(([year, months]) => (
            <section key={year} className="archive-animate">
              <div className="mb-8 sm:mb-12">
                <div className="inline-flex items-center bg-gray-900 dark:bg-white px-5 py-1.5 sm:px-6 sm:py-2 rounded-2xl shadow-xl">
                  <h2 className="text-xl sm:text-2xl font-black text-white dark:text-gray-900 tracking-tighter uppercase">
                    {year}
                  </h2>
                  <div className="w-[1px] h-4 bg-white/20 dark:bg-black/20 mx-3 sm:mx-4"></div>
                  <span className="text-[9px] sm:text-[10px] font-black text-white/50 dark:text-gray-500 uppercase tracking-widest">
                    Chronicle
                  </span>
                </div>
              </div>

              <div className="space-y-12 sm:space-y-16 pl-3 sm:pl-10 border-l-2 border-gray-100 dark:border-white/5">
                {Object.entries(months)
                  .sort(([monthA], [monthB]) => Number(monthB) - Number(monthA))
                  .map(([month, posts]) => (
                    <div key={month} className="space-y-6 sm:space-y-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                        <h3 className="text-md sm:text-lg font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest">
                          {month}月{" "}
                          <span className="ml-1 text-[9px] text-gray-400 font-normal">
                            / {posts.length} Posts
                          </span>
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                        {posts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
};

export default Archive;
