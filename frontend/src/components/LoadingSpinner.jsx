const LoadingSpinner = () => {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="text-gray-600 text-lg">Loading...</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
