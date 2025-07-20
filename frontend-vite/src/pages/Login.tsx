import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import './Login.css';
import oda_logo from '../images/oda_logo_white.png';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import { SiNaver } from "react-icons/si";

type Topic = {
    id: string;
    title: string;
    icon: React.ReactNode;
};

const topics: Topic[] = [
    {
        id: "https://www.naver.com/",
        title: "Naver",
        icon: <SiNaver size={24} color="#03c75a" />
    },
    {
        id: "https://www.instagram.com/",
        title: "Instagram",
        icon: <FaInstagram size={24} color="#E4405F" />
    },
    {
        id: "https://www.youtube.com/",
        title: "Youtube",
        icon: <FaYoutube size={24} color="#FF0000" />
    }
];

function Nav(props: { topics: Topic[] }) {
    return (
        <nav>
            <ul style={{ display: 'flex', gap: 10, listStyle: 'none', padding: 0, margin: 0 }}>
                {props.topics.map(t => (
                    <li key={t.id}>
                        <a href={t.id} target="_blank" rel="noopener noreferrer" title={t.title}>
                            {t.icon}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}


const Login = () => {
    const [username, setUsername] = useState(""); // id -> username
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // 에러 메시지
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    
    // 자동 로그아웃 타이머 등록 함수
    function setAutoLogout(token: string) {
        try {
            const decoded = jwtDecode(token);
            if (decoded.exp) {
                const expTime = decoded.exp * 1000; // ms
                const now = Date.now();
                const timeout = expTime - now;
                if (timeout > 0) {
                    setTimeout(() => {
                        localStorage.removeItem('access_token');
                        alert('세션이 만료되어 자동 로그아웃 됩니다.');
                        navigate('/login');
                    }, timeout);
                }
            }
        } catch (e) {
            // 토큰 파싱 실패시 바로 로그아웃
            localStorage.removeItem('access_token');
            navigate('/login');
        }
    }

     useEffect(() => {
        if (localStorage.getItem('access_token')) {
            navigate("/main/dashboard");
        }
    }, [navigate]);

    // 로그인 제출
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(""); // 에러 초기화

        if (!username || !password) {
            setError("아이디와 비밀번호를 입력하세요!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,   // FastAPI의 필드명과 일치!
                    password
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // 토큰 저장
                localStorage.setItem("access_token", data.access_token);
                setAutoLogout(data.access_token); // 이 줄이 반드시 있어야 경고가 안 뜸!

                // 대시보드로 이동
                navigate("/main/dashboard");
            } else {
                const err = await response.json();
                setError(err.detail || "로그인 실패! 아이디/비밀번호 확인");
            }
        } catch (err) {
            setError("서버 연결에 실패했습니다!");
        }
    };

    return (
        <div className="wrapper">
            <div className="container" style={{display: "flex", flexDirection: "row"}}>
                <div className="sign-in-container">
                    <form onSubmit={handleSubmit}>
                        <h1>oda_Login</h1>
                        <div className="social-links">
                            <Nav topics={topics} />
                        </div>
                        <span>or use your account</span>
                        <input
                            type="text"
                            placeholder="id"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                        <button className="form_btn" type="submit">
                            Log In
                        </button>
                        {error && (
                            <div style={{ color: "red", marginTop: 10, fontSize: 14 }}>
                                {error}
                            </div>
                        )}
                    </form>
                </div>
                <div className="overlay-right">
                    <img src={oda_logo} alt="오다 로고" style={{ width: 220, marginBottom: 32 }} />
                </div>
            </div>
        </div>
    );
};

export default Login;
