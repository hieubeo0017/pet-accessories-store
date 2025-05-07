import React, { useState, useEffect } from 'react';
import './BlogPage.css';

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        // Dữ liệu mẫu với URL đã được sửa
        const demoBlogs = [
            {
                id: 1,
                title: 'Cách chăm sóc thú cưng mùa đông',
                description: 'Hướng dẫn chi tiết cách giữ ấm và chăm sóc thú cưng của bạn trong mùa đông.',
                videoType: 'youtube',
                videoUrl: 'https://youtu.be/AprRsYjj5MI?si=c3qoDjcSYdTPQQs9', // URL này sẽ được chuyển đổi tự động
                poster: '/images/blog/blog1.jpg',
                date: '2025-04-01',
            },
            {
                id: 2,
                title: 'Lựa chọn thức ăn tốt nhất cho chó và mèo',
                description: 'Cách lựa chọn loại thức ăn tốt nhất cho thú cưng của bạn.',
                videoType: 'youtube',
                videoUrl: 'https://youtu.be/lfhCL4eA8c0?si=fXis_8cR9NT3KtqF',
                poster: '/images/blog/blog2.jpg',
                date: '2025-03-15',
            },
            {
                id: 3,
                title: 'Huấn luyện các kĩ năng cơ bản cho chó?',
                description: 'Các mẹo và kỹ thuật để huấn luyện cơ bản cho chó.',
                videoType: 'youtube',
                videoUrl: 'https://youtu.be/jFMA5ggFsXU?si=0gM9X9zheAVIyrue',
                poster: '/images/blog/blog3.jpg',
                date: '2025-02-28',
            },
        ];

        setBlogs(demoBlogs);
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('vi-VN', options).format(new Date(dateString));
    };

    // Thêm hàm chuyển đổi URL
    const getYoutubeEmbedUrl = (url) => {
        // Trích xuất ID video từ URL YouTube
        let videoId;
        
        // Kiểm tra nếu là URL dạng youtu.be
        if (url.includes('youtu.be')) {
            // Format: https://youtu.be/VIDEO_ID
            videoId = url.split('/').pop().split('?')[0];
        } 
        // Kiểm tra nếu là URL dạng youtube.com/watch
        else if (url.includes('youtube.com/watch')) {
            // Format: https://www.youtube.com/watch?v=VIDEO_ID
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get('v');
        }
        // Nếu đã là URL embed, trả về nguyên URL
        else if (url.includes('youtube.com/embed')) {
            return url;
        }
        
        // Trả về URL embed nếu tìm được ID video
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        
        // Nếu không phân tích được, trả về URL ban đầu
        return url;
    };

    // Sửa lại hàm renderVideo để sử dụng hàm chuyển đổi
    const renderVideo = (blog) => {
        if (blog.videoType === 'youtube') {
            const embedUrl = getYoutubeEmbedUrl(blog.videoUrl);
            return (
                <div className="blog-video-container">
                    <iframe
                        className="blog-video"
                        src={embedUrl}
                        title={blog.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            );
        } else {
            return (
                <video
                    src={blog.videoUrl || blog.video}
                    className="blog-video"
                    controls
                    poster={blog.poster}
                ></video>
            );
        }
    };

    return (
        <div className="blog-page">
            <h1 className="page-title">Blog Thú Cưng</h1>
            <div className="blog-list">
                {blogs.map((blog) => (
                    <div key={blog.id} className="blog-card">
                        {renderVideo(blog)}
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