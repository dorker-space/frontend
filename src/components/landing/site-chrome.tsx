import { useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { PROJECT_URL } from "@/components/landing/links";

export function LandingHeader() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-[#fcf9f0]/90 backdrop-blur-md border-b border-[#e2ded6]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                {/* App Brand Matching CleanShot Screenshots */}
                <a className="flex items-center gap-2 group shrink-0" href="#">
                    <img
                        alt="Dorker icon"
                        className="w-8 h-8 rounded-lg object-contain"
                        src="/dorker-icon.svg"
                    />
                    <div className="flex items-baseline">
                        <span className="text-xl font-bold tracking-tight text-[#091e42]">
                            Dorker
                        </span>
                        <span className="text-xl font-bold text-[#1d4ed8]">
                            .space
                        </span>
                    </div>
                </a>

                {/* Clean Text Navigation Links */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#43474f]">
                    <a
                        className="hover:text-[#1d4ed8] transition-colors whitespace-nowrap"
                        href="#how-it-works"
                    >
                        How It Works
                    </a>
                    <a
                        className="hover:text-[#1d4ed8] transition-colors whitespace-nowrap"
                        href="#the-dossier"
                    >
                        The Dossier
                    </a>
                    <a
                        className="hover:text-[#1d4ed8] transition-colors whitespace-nowrap"
                        href="#founder-note"
                    >
                        Founder Note
                    </a>
                    <a
                        className="flex items-center gap-2 text-[#43474f] hover:text-[#091e42] transition-colors whitespace-nowrap"
                        href={PROJECT_URL}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <svg
                            className="w-4 h-4 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                clipRule="evenodd"
                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                fillRule="evenodd"
                            />
                        </svg>
                        <span className="font-medium">GitHub</span>
                        <span className="hidden sm:inline bg-[#ebe8e0] text-[#43474f] px-2 py-0.5 rounded-full text-[11px] border border-[#e2ded6] whitespace-nowrap">
                            Source available • Free to self-host
                        </span>
                    </a>
                </nav>

                {/* Primary Action CTA */}
                <div className="flex items-center gap-3 shrink-0">
                    <a
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#1d4ed8] hover:bg-[#1e40af] transition-colors rounded-xl shadow-sm shadow-[#1d4ed8]/15 whitespace-nowrap"
                        href="#request-access"
                    >
                        Request Beta Access
                    </a>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="md:hidden p-1.5 text-[#43474f] hover:text-[#091e42] rounded-lg"
                        aria-label="Toggle navigation menu"
                    >
                        {menuOpen ? (
                            <XIcon className="size-5" />
                        ) : (
                            <MenuIcon className="size-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Navigation */}
            {menuOpen && (
                <nav className="md:hidden border-t border-[#e2ded6] bg-[#fcf9f0] px-4 py-3 space-y-2 text-sm font-medium text-[#43474f]">
                    <a
                        className="block py-1.5 hover:text-[#1d4ed8]"
                        href="#how-it-works"
                        onClick={() => setMenuOpen(false)}
                    >
                        How It Works
                    </a>
                    <a
                        className="block py-1.5 hover:text-[#1d4ed8]"
                        href="#the-dossier"
                        onClick={() => setMenuOpen(false)}
                    >
                        The Dossier
                    </a>
                    <a
                        className="block py-1.5 hover:text-[#1d4ed8]"
                        href="#founder-note"
                        onClick={() => setMenuOpen(false)}
                    >
                        Founder Note
                    </a>
                    <a
                        className="block py-1.5 hover:text-[#1d4ed8]"
                        href={PROJECT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                    >
                        GitHub Source (Free to self-host)
                    </a>
                </nav>
            )}
        </header>
    );
}

export function LandingFooter() {
    return (
        <footer className="py-10 px-4 sm:px-6 bg-[#f6f3eb] border-t border-[#e2ded6] text-xs text-[#737780]">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                        <img
                            alt="Dorker icon"
                            className="w-5 h-5 rounded object-contain"
                            src="/dorker-icon.svg"
                        />
                        <span className="font-bold text-[#091e42]">
                            Dorker.space
                        </span>
                        <span className="text-[#737780]">© 2026</span>
                    </div>
                    <span className="hidden sm:inline text-[#737780]">•</span>
                    <span className="text-[#43474f]">
                        Source available • Free to self-host for personal job
                        searches
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <a
                        className="hover:text-[#091e42] transition-colors whitespace-nowrap"
                        href={PROJECT_URL}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        GitHub Source
                    </a>
                    <a
                        className="hover:text-[#091e42] transition-colors whitespace-nowrap"
                        href="https://www.linkedin.com/in/serafym-podolianchuk/"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Founder LinkedIn
                    </a>
                    <a
                        className="hover:text-[#091e42] transition-colors whitespace-nowrap"
                        href="mailto:serafym.podolyanchuk@gmail.com"
                    >
                        Contact
                    </a>
                </div>
            </div>
        </footer>
    );
}
