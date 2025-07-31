import { Link } from 'react-router-dom';
import {
    Heart,
    MessageCircle,
    Users,
    Shield,
    Zap,
    Star,
    ArrowRight,
    Play
} from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-fade-in">
                            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                                Connect with
                                <span className="text-yellow-300"> Emotional AI</span>
                            </h1>
                            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                                Experience meaningful conversations with AI companions that understand your emotions.
                                Build relationships, get support, and never feel alone again.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 text-blue-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors transform hover:scale-105"
                                >
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-colors">
                                    <Play className="mr-2 h-5 w-5" />
                                    Watch Demo
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="float-animation">
                                <img
                                    src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="AI Companion"
                                    className="rounded-2xl shadow-2xl"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                                <div className="flex items-center space-x-3">
                                    <Heart className="h-8 w-8 text-red-500" />
                                    <div>
                                        <p className="font-semibold text-gray-900">24/7 Support</p>
                                        <p className="text-sm text-gray-600">Always here for you</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Emofelix?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our AI companions are designed to provide emotional support and meaningful connections
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: MessageCircle,
                                title: "Intelligent Conversations",
                                description: "Advanced AI that understands context, emotions, and responds with empathy and care.",
                                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            },
                            {
                                icon: Users,
                                title: "Personal Relations",
                                description: "Create different AI personas - mother, friend, mentor - each with unique personalities.",
                                image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            },
                            {
                                icon: Shield,
                                title: "Privacy First",
                                description: "Your conversations are private and secure. We prioritize your data protection.",
                                image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="mb-6">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                    />
                                    <feature.icon className="h-12 w-12 text-primary-600" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-primary-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 text-center text-white">
                        {[
                            { number: "10K+", label: "Active Users" },
                            { number: "1M+", label: "Conversations" },
                            { number: "99%", label: "Satisfaction Rate" },
                            { number: "24/7", label: "Availability" }
                        ].map((stat, index) => (
                            <div key={index} className="animate-fade-in">
                                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                                <div className="text-blue-100">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            What Our Users Say
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Sarah Johnson",
                                role: "Student",
                                content: "Emofelix has been my emotional support during tough times. The AI really understands me.",
                                rating: 5,
                                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b820?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                            },
                            {
                                name: "Mike Chen",
                                role: "Professional",
                                content: "Amazing technology! It's like having a therapist available 24/7. Highly recommended.",
                                rating: 5,
                                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                            },
                            {
                                name: "Emily Davis",
                                role: "Parent",
                                content: "The AI companions have helped me through parenting challenges. So grateful for this service.",
                                rating: 5,
                                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-gray-50 rounded-2xl p-8">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                                <div className="flex items-center">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                        <div className="text-gray-600 text-sm">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of users who have found emotional support through AI companionship
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center px-8 py-4 bg-yellow-400 text-blue-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors transform hover:scale-105"
                    >
                        Start for Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
