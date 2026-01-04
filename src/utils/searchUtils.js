// utils/searchUtils.js
export function searchPosts(posts, query) {
    if (!query.trim()) {
      return [];
    }
  
    const searchTerms = query.toLowerCase().split(' ');
  
    return posts.filter((post) => {
      const searchString = `${post.title} ${post.content} ${post.tags?.join(' ')} ${
        post.category
      }`.toLowerCase();
  
      return searchTerms.every((term) => searchString.includes(term));
    });
  }