import React, { useState, useEffect } from 'react';
import './BlogPage.css';

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        // Dữ liệu giả lập cho các bài viết blog với video
        const demoBlogs = [
            {
                id: 1,
                title: 'Cách chăm sóc thú cưng mùa đông',
                description: 'Hướng dẫn chi tiết cách giữ ấm và chăm sóc thú cưng của bạn trong mùa đông.',
                video: '/videos/cham-soc-cho-MD.mp4',
                poster: '/images/blog/blog1.jpg', // Hình ảnh poster
                date: '2025-04-01',
            },
            {
                id: 2,
                title: 'Lựa chọn thức ăn tốt nhất cho chó và mèo',
                description: 'Cách lựa chọn loại thức ăn tốt nhất cho thú cưng của bạn.',
                video: '/videos/thuc-an.mp4',
                poster: '/images/blog/blog2.jpg', // Hình ảnh poster
                date: '2025-03-15',
            },
            {
                id: 3,
                title: 'Huấn luyện các kĩ năng cơ bản cho chó?',
                description: 'Các mẹo và kỹ thuật để huấn luyện cơ bản cho chó.',
                video: '/videos/huan-luyen.mp4',
                poster: '/images/blog/blog3.jpg', // Hình ảnh poster
                date: '2025-02-28',
            },
        ];

        setBlogs(demoBlogs);
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('vi-VN', options).format(new Date(dateString));
    };

    return (
        <div className="blog-page">
            <h1 className="page-title">Blog Thú Cưng</h1>
            <div className="blog-list">
                {blogs.map((blog) => (
                    <div key={blog.id} className="blog-card">
                        <video
                            src={blog.video}
                            className="blog-video"
                            controls
                            poster={blog.poster} // Sử dụng hình ảnh poster từ dữ liệu
                        ></video>
                        <div className="blog-content">
                            <h2 className="blog-title">{blog.title}</h2>
                            <p className="blog-description">{blog.description}</p>
                            <p className="blog-date">Ngày đăng: {formatDate(blog.date)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogPage;