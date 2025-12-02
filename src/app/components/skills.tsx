"use client";

export default function Skills() {
    // skillicons.dev で使用するスキルID
    const languages = ["js", "ts", "ruby", "go", "html"];
    const frameworks = ["react", "nextjs", "discordjs", "tailwind", "nodejs"];
    const tools = ["docker", "kubernetes", "git", "github", "figma"];

    const languagesUrl = `https://skillicons.dev/icons?i=${languages.join(",")}&theme=light`;
    const frameworksUrl = `https://skillicons.dev/icons?i=${frameworks.join(",")}&theme=light`;
    const toolsUrl = `https://skillicons.dev/icons?i=${tools.join(",")}&theme=light`;

    return (
        <section id="skills" className="py-20 px-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Skills</h2>
                
                <div className="flex flex-col gap-10">
                    {/* 言語 */}
                    <div className="text-center select-none">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Languages</h3>
                        <div className="flex justify-center">
                            <img 
                                src={languagesUrl}
                                alt="Languages"
                                className="max-w-full"
                            />
                        </div>
                    </div>

                    {/* フレームワーク */}
                    <div className="text-center select-none">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Frameworks</h3>
                        <div className="flex justify-center">
                            <img 
                                src={frameworksUrl}
                                alt="Frameworks"
                                className="max-w-full"
                            />
                        </div>
                    </div>

                    {/* ツール */}
                    <div className="text-center select-none">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Tools</h3>
                        <div className="flex justify-center">
                            <img 
                                src={toolsUrl}
                                alt="Tools"
                                className="max-w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
