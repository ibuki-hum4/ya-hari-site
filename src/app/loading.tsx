export default function Loading() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                {/* スピナー */}
                <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
                </div>
                
                {/* テキスト */}
                <p className="text-gray-500 dark:text-gray-400 text-sm tracking-widest">
                    LOADING...
                </p>
            </div>
        </div>
    );
}
