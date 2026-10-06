export default function ApplicationLogo({ className = 'h-16 w-auto', ...props }) {
    return (
        <div className="flex items-center space-x-3 select-none">
            {/* Colorful Rainbow Flower Icon with Smiley Face */}
            <svg
                className={className}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                {...props}
            >
                {/* Petals - Rainbow Colors */}
                {/* Red/Pink Petal (Top) */}
                <circle cx="50" cy="22" r="14" fill="#FF8B94" />
                {/* Orange Petal (Top Right) */}
                <circle cx="73" cy="33" r="14" fill="#FFAAA6" />
                {/* Yellow Petal (Bottom Right) */}
                <circle cx="75" cy="61" r="14" fill="#FFD3B6" />
                {/* Green Petal (Bottom) */}
                <circle cx="50" cy="78" r="14" fill="#D4ECB8" />
                {/* Blue/Teal Petal (Bottom Left) */}
                <circle cx="25" cy="61" r="14" fill="#A8E6CF" />
                {/* Purple/Aqua Petal (Top Left) */}
                <circle cx="27" cy="33" r="14" fill="#B8F2E6" />
                
                {/* Center of the flower - Yellow Smiley Face */}
                <circle cx="50" cy="50" r="22" fill="#FFE57F" stroke="#333333" strokeWidth="2.5" />
                
                {/* Smiley Eyes */}
                <circle cx="42" cy="45" r="3" fill="#333333" />
                <circle cx="58" cy="45" r="3" fill="#333333" />
                
                {/* Smiley Mouth */}
                <path
                    d="M 40 54 Q 50 64 60 54"
                    fill="none"
                    stroke="#333333"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
            </svg>
            
            {/* Serif Wordmark */}
            <span className="font-serif font-bold text-gray-800 text-xl tracking-tight leading-none">
                Happy Kid <br/>
                <span className="text-gray-600 font-semibold text-sm tracking-normal">Arts & Tutorials</span>
            </span>
        </div>
    );
}
