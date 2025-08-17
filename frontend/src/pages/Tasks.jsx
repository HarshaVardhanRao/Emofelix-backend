import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../apiBase';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const Tasks = () => {
    const { user, updateUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState({});
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [myReferralData, setMyReferralData] = useState(null);

    // Review form state
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        what_you_like: '',
        what_to_improve: '',
        recommend_to_others: true,
        favorite_feature: '',
        additional_feedback: ''
    });

    // Referral code input state
    const [inputReferralCode, setInputReferralCode] = useState('');
    const [redeemCode, setRedeemCode] = useState('');

    useEffect(() => {
        fetchTasks();
        fetchCompletedTasks();
        fetchMyReferralCode();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const fetchCompletedTasks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks/completed/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCompletedTasks(data);
            }
        } catch (error) {
            console.error('Error fetching completed tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyReferralCode = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/referrals/my-code/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMyReferralData(data);
            }
        } catch (error) {
            console.error('Error fetching referral code:', error);
        }
    };

    const completeTask = async (taskId) => {
        setProcessing(prev => ({ ...prev, [taskId]: true }));
        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/complete/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                updateUser({ emocoins: data.total_emocoins });
                fetchTasks();
                fetchCompletedTasks();
            } else {
                alert(data.error || 'Failed to complete task');
            }
        } catch (error) {
            console.error('Error completing task:', error);
            alert('Failed to complete task');
        } finally {
            setProcessing(prev => ({ ...prev, [taskId]: false }));
        }
    };

    const submitReview = async () => {
        if (!reviewForm.what_you_like.trim()) {
            alert('Please tell us what you like about the app');
            return;
        }

        setProcessing(prev => ({ ...prev, review: true }));
        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews/submit/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewForm)
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                if (data.emocoins_earned) {
                    updateUser({ emocoins: data.total_emocoins });
                }
                setShowReviewModal(false);
                fetchTasks();
                fetchCompletedTasks();
            } else {
                alert(data.error || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review');
        } finally {
            setProcessing(prev => ({ ...prev, review: false }));
        }
    };

    const useReferralCode = async () => {
        if (!inputReferralCode.trim()) {
            alert('Please enter a referral code');
            return;
        }

        setProcessing(prev => ({ ...prev, referral: true }));
        try {
            const response = await fetch(`${API_BASE_URL}/api/referrals/use-code/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ referral_code: inputReferralCode })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                updateUser({ emocoins: data.total_emocoins });
                setShowReferralModal(false);
                setInputReferralCode('');
                fetchTasks();
                fetchCompletedTasks();
            } else {
                alert(data.error || 'Failed to use referral code');
            }
        } catch (error) {
            console.error('Error using referral code:', error);
            alert('Failed to use referral code');
        } finally {
            setProcessing(prev => ({ ...prev, referral: false }));
        }
    };

    const redeemReferralCode = async () => {
        if (!redeemCode.trim()) {
            alert('Please enter a referral code');
            return;
        }

        setProcessing(prev => ({ ...prev, redeem: true }));
        try {
            const response = await fetch(`${API_BASE_URL}/api/referrals/redeem-code/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: redeemCode })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                // Refresh user data to get updated credits
                setRedeemCode('');
                fetchTasks();
                fetchCompletedTasks();
            } else {
                alert(data.error || 'Failed to redeem code');
            }
        } catch (error) {
            console.error('Error redeeming code:', error);
            alert('Failed to redeem code');
        } finally {
            setProcessing(prev => ({ ...prev, redeem: false }));
        }
    };

    const copyReferralCode = () => {
        if (myReferralData?.referral_code) {
            navigator.clipboard.writeText(myReferralData.referral_code);
            alert('Referral code copied to clipboard!');
        }
    };

    const copyReferralUrl = () => {
        if (myReferralData?.referral_url) {
            navigator.clipboard.writeText(myReferralData.referral_url);
            alert('Referral URL copied to clipboard!');
        }
    };

    const handleTaskClick = (task) => {
        if (task.task_type === 'REVIEW') {
            setShowReviewModal(true);
        } else if (task.task_type === 'REFERRAL') {
            setShowReferralModal(true);
        } else {
            completeTask(task.id);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800">
                <Navbar />
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">🎯 Earn Emocoins</h1>
                    <p className="text-pink-200 text-lg">Complete tasks to earn emocoins and unlock more features!</p>
                    <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-6 inline-block">
                        <span className="text-white text-lg font-semibold">
                            💎 Your Balance: {user?.emocoins || 0} Emocoins
                        </span>
                    </div>
                </div>

                {/* My Referral Info */}
                {myReferralData && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">🤝 Your Referral Program</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-lg p-4">
                                <p className="text-pink-200 mb-2">Your Referral Code:</p>
                                <div className="flex items-center gap-2">
                                    <code className="bg-black/20 text-white px-3 py-2 rounded font-mono text-lg">
                                        {myReferralData.referral_code}
                                    </code>
                                    <button
                                        onClick={copyReferralCode}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <p className="text-pink-200 mb-2">Referral Stats:</p>
                                <p className="text-white">
                                    Total Referrals: {myReferralData.total_referrals} |
                                    Successful: {myReferralData.successful_referrals}
                                </p>
                                <p className="text-green-300 text-sm">
                                    {myReferralData.reward_per_referral} emocoins per successful referral
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={copyReferralUrl}
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            📋 Copy Referral Link
                        </button>
                    </div>
                )}

                {/* Redeem Code Section */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">🎫 Redeem Special Codes</h2>
                    <p className="text-pink-200 mb-4">Have a special referral code? Redeem it here for bonus credits!</p>
                    <div className="flex gap-3 max-w-md">
                        <input
                            type="text"
                            className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-pink-300 focus:outline-none focus:border-purple-400"
                            value={redeemCode}
                            onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                            placeholder="Enter code (e.g., WELCOME2024)"
                        />
                        <button
                            onClick={redeemReferralCode}
                            disabled={processing.redeem}
                            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            {processing.redeem ? 'Redeeming...' : 'Redeem'}
                        </button>
                    </div>
                    <p className="text-pink-300 text-sm mt-2">
                        💡 Try codes like: WELCOME2024, NEWUSER50, BETA100
                    </p>
                </div>

                {/* Available Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">✨ Available Tasks</h2>
                        <div className="space-y-4">
                            {tasks.length === 0 ? (
                                <p className="text-pink-200">No available tasks at the moment.</p>
                            ) : (
                                tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={`bg-white/10 rounded-lg p-4 border-2 transition-all ${task.can_complete
                                                ? 'border-green-400 hover:border-green-300 cursor-pointer hover:bg-white/20'
                                                : 'border-gray-500 opacity-60'
                                            }`}
                                        onClick={() => task.can_complete && handleTaskClick(task)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white text-lg">{task.title}</h3>
                                            <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-bold">
                                                +{task.reward_emocoins} 💎
                                            </span>
                                        </div>
                                        <p className="text-pink-200 mb-3">{task.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-pink-300">
                                                Completed: {task.completion_count}/{task.max_completions_per_user}
                                            </span>
                                            {task.can_complete && (
                                                <button
                                                    disabled={processing[task.id]}
                                                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    {processing[task.id] ? 'Processing...' : 'Complete Task'}
                                                </button>
                                            )}
                                            {!task.can_complete && (
                                                <span className="text-gray-400 text-sm">Completed</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Completed Tasks */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">✅ Completed Tasks</h2>
                        <div className="space-y-3">
                            {completedTasks.length === 0 ? (
                                <p className="text-pink-200">No completed tasks yet. Start earning!</p>
                            ) : (
                                completedTasks.map((userTask) => (
                                    <div key={userTask.id} className="bg-white/10 rounded-lg p-3">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold text-white">{userTask.task_details.title}</h3>
                                                <p className="text-sm text-pink-200">
                                                    Completed on {new Date(userTask.completed_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                                                +{userTask.task_details.reward_emocoins} 💎
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">📝 Review Our App</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Rating *</label>
                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                                className={`text-2xl ${star <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                            >
                                                ⭐
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">What do you like most about the app? *</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        rows="3"
                                        value={reviewForm.what_you_like}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, what_you_like: e.target.value }))}
                                        placeholder="Tell us what you enjoy about using Emofelix..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">What could be improved?</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        rows="2"
                                        value={reviewForm.what_to_improve}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, what_to_improve: e.target.value }))}
                                        placeholder="Any suggestions for improvement..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">What's your favorite feature?</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        value={reviewForm.favorite_feature}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, favorite_feature: e.target.value }))}
                                        placeholder="e.g., AI characters, voice calls, chat..."
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={reviewForm.recommend_to_others}
                                            onChange={(e) => setReviewForm(prev => ({ ...prev, recommend_to_others: e.target.checked }))}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Would you recommend this app to others?</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Additional feedback</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        rows="2"
                                        value={reviewForm.additional_feedback}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, additional_feedback: e.target.value }))}
                                        placeholder="Any other thoughts or suggestions..."
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={submitReview}
                                    disabled={processing.review}
                                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-colors"
                                >
                                    {processing.review ? 'Submitting...' : 'Submit Review (+5 💎)'}
                                </button>
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Referral Modal */}
            {showReferralModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">🤝 Use Referral Code</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Referral Code</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase"
                                        value={inputReferralCode}
                                        onChange={(e) => setInputReferralCode(e.target.value.toUpperCase())}
                                        placeholder="Enter referral code..."
                                    />
                                    <p className="text-sm text-gray-600 mt-1">
                                        Enter a friend's referral code to earn bonus emocoins!
                                    </p>
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={useReferralCode}
                                    disabled={processing.referral}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-colors"
                                >
                                    {processing.referral ? 'Processing...' : 'Use Code (+5 💎)'}
                                </button>
                                <button
                                    onClick={() => setShowReferralModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;