const TopBar = ({ ttft }: { ttft: number | null }) => {

    return (
        <div className="p-4 bg-[#004a9e] text-white sticky top-0 z-10 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Chat App</h1>

                    {ttft !== null && (
                        <div className="mt-1 text-md">
                            <span className="font-semibold">Time to First Token (TTFT):</span> {ttft} ms
                        </div>
                    )}
                </div>
    );
};

export default TopBar;