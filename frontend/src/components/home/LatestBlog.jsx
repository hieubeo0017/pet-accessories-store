import React from 'react';
import { Link } from 'react-router-dom';
import './LatestBlog.css';

const blogPosts = [
    {
        id: 1,
        title: 'Cách chăm sóc lông chó mùa hè',
        excerpt: 'Những điều cần lưu ý để chăm sóc lông chó trong mùa nóng...',
        image: '/images/blog/blog1.jpg',
        date: '15/04/2025'
    },
    {
        id: 2,
        title: 'Dinh dưỡng cần thiết cho mèo con',
        excerpt: 'Chế độ dinh dưỡng phù hợp giúp mèo con phát triển khỏe mạnh...',
        image: '/images/blog/blog2.jpg',
        date: '02/04/2025'
    },
    {
        id: 3,
        title: 'Top 5 đồ chơi an toàn cho thú cưng',
        excerpt: 'Những loại đồ chơi giúp thú cưng vui chơi mà không gây hại...',
        image: '/images/blog/blog3.jpg',
        date: '28/03/2025'
    }
];

const LatestBlog = () => {
    return (
        <section className="latest-blog">
            <h2 className="section-title">Bài Viết Mới Nhất</h2>
            <div className="blog-container">
                {blogPosts.map(post => (
                    <div key={post.id} className="blog-card">
                        <div className="blog-image">
                            <img src={post.image} alt={post.title} />
                            <div className="blog-date">{post.date}</div>
                        </div>
                        <div className="blog-content">
                            <h3>{post.title}</h3>
                            <p>{post.excerpt}</p>
                            <Link to={`/blog/${post.id}`} className="read-more">
                                Đọc tiếp
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            <div className="view-more">
                <Link to="/blogs" className="view-more-btn">Xem tất cả bài viết</Link>
            </div>
        </section>
    );
};

export default LatestBlog;