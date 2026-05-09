import { useNavigate } from "react-router-dom";

function Home() {

    const navigate = useNavigate();

    return (
        <div className="flex flex-row gap-10 min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 p-10">
            <h1 className="text-5xl font-bold text-white mb-10">
                Welcome to Iron Factory Dashboard
            </h1>

            {/* Cards Container */}
            <div className="flex flex-wrap gap-8 items-start">

                <div className="w-[320px] bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    {/* Image */}
                    <div className="h-44 bg-gradient-to-br from-zinc-700 to-zinc-900 relative">
                        <div className="absolute inset-0 bg-black/10" />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        <h2 className="text-2xl font-bold text-zinc-900">
                            Mechanical Section
                        </h2>
                        <p className="text-zinc-500 mt-3 leading-relaxed">
                            Monitor and manage all operations inside the factory system.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-zinc-200 p-4">
                        <button
                            className="w-full bg-black hover:bg-zinc-800 text-white font-semibold py-3 rounded-xl transition-all duration-300"
                            onClick={() => navigate("/mechanical")}
                        >
                            Open Section
                        </button>
                    </div>
                </div>

            </div>

            <div className="flex flex-wrap gap-8 items-start">

                <div className="w-[320px] bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    {/* Image */}
                    <div className="h-44 bg-gradient-to-br from-zinc-700 to-zinc-900 relative">
                        <div className="absolute inset-0 bg-black/10" />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        <h2 className="text-2xl font-bold text-zinc-900">
                            Electrical Section
                        </h2>
                        <p className="text-zinc-500 mt-3 leading-relaxed">
                            Monitor and manage all operations inside the factory system.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-zinc-200 p-4">
                        <button
                            className="w-full bg-black hover:bg-zinc-800 text-white font-semibold py-3 rounded-xl transition-all duration-300"
                            onClick={() => navigate("/electrical")}
                        >
                            Open Section
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Home;