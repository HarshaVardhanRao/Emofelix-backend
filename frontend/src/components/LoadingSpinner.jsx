import { Heart, Sparkles } from 'lucide-react';

const LoadingSpinner = () => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center z-50">
            {/* Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-neon-blue rounded-full animate-float-bounce opacity-60"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${3 + Math.random() * 3}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className="glass-card rounded-3xl p-12 text-center animate-bounce-in">
                <div className="flex flex-col items-center space-y-6">
                    {/* Main Loading Animation */}
                    <div className="relative">
                        <div className="loading-glass w-16 h-16"></div>
                        <Heart className="absolute inset-0 m-auto h-8 w-8 text-neon-pink animate-pulse-glow" />
                        <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-neon-blue animate-ping" />
                    </div>

                    {/* Loading Text */}
                    <div className="space-y-2">
                        <p className="text-white text-xl font-bold holo-text">
                            ✨ Loading Magic...
                        </p>
                        <p className="text-gray-300 text-sm">
                            Preparing your emotional journey 🚀
                        </p>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex space-x-2">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="w-3 h-3 bg-neon-blue rounded-full animate-pulse"
                                style={{
                                    animationDelay: `${i * 0.3}s`,
                                    animationDuration: '1.5s'
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
