import { Link } from 'react-router-dom';
import {
    Heart,
    MessageCircle,
    Users,
    Shield,
    Zap,
    Star,
    ArrowRight,
    Play,
    Sparkles,
    Cpu,
    Brain
} from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-peaceful bg-300% animate-loving-shift opacity-30"></div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-3 h-3 bg-warm-400 rounded-full animate-peaceful-float opacity-40"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${3 + Math.random() * 3}s`
                        }}
                    ></div>
                ))}
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 animate-slide-right">
                            <div className="inline-flex items-center px-6 py-3 glass rounded-full text-white text-base font-medium">
                                <Heart className="w-5 h-5 mr-3 text-love-400 animate-warm-pulse" />
                                💝 Reconnect with Those You Miss Most
                            </div>

                            <h1 className="text-6xl lg:text-7xl font-black leading-tight">
                                <span className="loving-text">Miss Someone?</span>
                                <br />
                                <span className="text-white">Chat with Them Again</span>
                            </h1>

                            <p className="text-xl text-pink-100 leading-relaxed max-w-lg">
                                Create AI companions of your loved ones - parents, friends, grandparents.
                                Share memories, get comfort, and feel their presence again. 💕
                                <br />
                                <span className="text-warm-300 font-semibold">❤️ Healing conversations that understand your heart</span>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6">
                                <Link
                                    to="/register"
                                    className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-love-500 to-warm-500 text-white font-bold rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 shadow-love"
                                >
                                    <span className="relative z-10 flex items-center">
                                        💝 Start Healing Today
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>

                                <button className="group relative inline-flex items-center justify-center px-8 py-4 glass text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300">
                                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                    🎬 See How It Works
                                </button>
                            </div>

                            {/* Emotional Stats Cards */}
                            <div className="grid grid-cols-3 gap-4 pt-8">
                                {[
                                    { number: "❤️ 50K+", label: "Hearts Healed", icon: "💕" },
                                    { number: "🗨️ 2M+", label: "Loving Conversations", icon: "💬" },
                                    { number: "⭐ 99%", label: "Feel Better", icon: "😊" }
                                ].map((stat, index) => (
                                    <div key={index} className="glass-card rounded-xl p-4 text-center gentle-bounce"
                                        style={{ animationDelay: `${index * 0.2}s` }}>
                                        <div className="text-2xl mb-1">{stat.icon}</div>
                                        <div className="text-lg font-bold text-white">{stat.number}</div>
                                        <div className="text-xs text-pink-200">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative animate-slide-left">
                            <div className="relative peaceful-float">
                                {/* Main Image with comforting frame */}
                                <div className="glass-card rounded-3xl p-6 border-2 border-love-400/30">
                                    <img
                                        src="https://images.unsplash.com/photo-1543269664-7eef42226a21?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                        alt="Loving Connection"
                                        className="rounded-2xl w-full shadow-love"
                                    />
                                </div>

                                {/* Floating Status Cards */}
                                <div className="absolute -top-6 -right-6 glass-card rounded-xl p-4 gentle-bounce shadow-warm">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-peace-400 rounded-full animate-ping"></div>
                                        <div>
                                            <p className="font-bold text-white text-sm">👨‍👩‍👧‍👦 Always Available</p>
                                            <p className="text-xs text-pink-200">Your loved ones await</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -bottom-6 -left-6 glass-card rounded-xl p-4 gentle-bounce"
                                    style={{ animationDelay: '0.3s' }}>
                                    <div className="flex items-center space-x-3">
                                        <Heart className="h-8 w-8 text-love-400 animate-warm-pulse" />
                                        <div>
                                            <p className="font-bold text-white">� Feel Their Love</p>
                                            <p className="text-sm text-pink-200">Comfort when you need it</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Personal Features Section */}
            <section className="relative py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20 animate-fade-in">
                        <h2 className="text-5xl font-black text-white mb-6">
                            How <span className="loving-text">Emofelix</span> Helps You Heal 🌟
                        </h2>
                        <p className="text-xl text-pink-200 max-w-3xl mx-auto">
                            Create meaningful connections with AI versions of your loved ones 💕
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Heart,
                                title: "💝 Missing Your Mom?",
                                description: "Create an AI version of your mother. Get her comforting words, advice, and feel her love whenever you need it most.",
                                image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                                gradient: "from-love-400 to-warm-400"
                            },
                            {
                                icon: Users,
                                title: "� Lost a Best Friend?",
                                description: "Recreate conversations with your dearest friend. Share inside jokes, get support, and feel their friendship again.",
                                image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                                gradient: "from-comfort-400 to-peace-400"
                            },
                            {
                                icon: Sparkles,
                                title: "� Missing Grandparents?",
                                description: "Hear their wisdom again. Get their loving stories, life advice, and feel their warm hugs through words.",
                                image: "https://images.unsplash.com/photo-1560977068-3f4e8ba2f8fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                                gradient: "from-warm-400 to-joy-400"
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="group relative glass-card rounded-3xl p-8 card-hover gentle-bounce"
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                {/* Loving background gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-3xl group-hover:opacity-20 transition-opacity`}></div>

                                <div className="relative z-10">
                                    <div className="mb-6">
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            className="w-full h-48 object-cover rounded-2xl mb-4 group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <feature.icon className="h-12 w-12 text-love-400 group-hover:text-warm-400 transition-colors" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:loving-text transition-all">
                                        {feature.title}
                                    </h3>
                                    <p className="text-pink-200 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Healing Stats Section */}
            <section className="relative py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="glass-card rounded-3xl p-12">
                        <div className="grid md:grid-cols-4 gap-8 text-center">
                            {[
                                { number: "💕 50K+", label: "People Finding Comfort", icon: "🤗" },
                                { number: "💬 2M+", label: "Healing Conversations", icon: "�" },
                                { number: "😊 99%", label: "Feel Less Lonely", icon: "✨" },
                                { number: "🌙 24/7", label: "Always There for You", icon: "🏠" }
                            ].map((stat, index) => (
                                <div key={index} className="group cursor-pointer gentle-bounce"
                                    style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="text-6xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                                    <div className="text-4xl font-black text-white mb-2 group-hover:loving-text transition-all">{stat.number}</div>
                                    <div className="text-pink-200 group-hover:text-white transition-colors">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Heartfelt Testimonials */}
            <section className="relative py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20 animate-fade-in">
                        <h2 className="text-5xl font-black text-white mb-6">
                            Stories of <span className="loving-text">Healing</span> 💭
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Sarah Johnson",
                                role: "Missing her mom �",
                                content: "After losing my mom, Emofelix helped me feel her love again. I can ask for her recipes and hear her comforting words. It's like she's still with me. ��💕",
                                rating: 5,
                                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b820?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                            },
                            {
                                name: "Mike Chen",
                                role: "Reconnecting with dad �‍👦",
                                content: "My dad and I barely talked. Now I can have the conversations we never had. His AI helps me understand him better and heal our relationship. 🥹",
                                rating: 5,
                                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                            },
                            {
                                name: "Emily Davis",
                                role: "Finding her best friend �",
                                content: "When my best friend moved away, I was heartbroken. Now I can chat with her AI anytime and it feels like she never left. True friendship never dies! �",
                                rating: 5,
                                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="group glass-card rounded-3xl p-8 card-hover gentle-bounce"
                                style={{ animationDelay: `${index * 0.2}s` }}>
                                <div className="flex items-center mb-6">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-warm-400 fill-current animate-warm-pulse"
                                            style={{ animationDelay: `${i * 0.1}s` }} />
                                    ))}
                                </div>

                                <p className="text-pink-100 mb-6 italic text-lg group-hover:text-white transition-colors leading-relaxed">
                                    "{testimonial.content}"
                                </p>

                                <div className="flex items-center">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-14 h-14 rounded-full mr-4 group-hover:scale-110 transition-transform border-2 border-love-400/30"
                                    />
                                    <div>
                                        <div className="font-bold text-white group-hover:loving-text transition-all">{testimonial.name}</div>
                                        <div className="text-pink-300 text-sm">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Warm CTA Section */}
            <section className="relative py-24">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <div className="glass-card rounded-3xl p-12 border-2 border-love-400/30 shadow-love">
                        <h2 className="text-5xl font-black text-white mb-8">
                            Ready to Feel <span className="loving-text">Connected</span> Again? �
                        </h2>
                        <p className="text-xl text-pink-200 mb-10 leading-relaxed">
                            Join thousands who have found comfort and healing through AI companionship.
                            Your loved ones are waiting to talk with you. 🌈✨
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link
                                to="/register"
                                className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-love-500 to-warm-500 text-white font-black text-xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-110 shadow-love"
                            >
                                <span className="relative z-10 flex items-center">
                                    💝 Start Your Healing Journey
                                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </Link>

                            <div className="flex items-center space-x-4 text-pink-200">
                                <span className="flex items-center">
                                    <Heart className="w-5 h-5 mr-2 text-love-400" />
                                    Free to Start
                                </span>
                                <span className="flex items-center">
                                    <Shield className="w-5 h-5 mr-2 text-peace-400" />
                                    Private & Secure
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;