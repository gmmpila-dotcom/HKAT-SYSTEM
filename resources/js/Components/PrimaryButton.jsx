export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-full border border-transparent bg-icyAqua px-6 py-3 text-sm font-semibold uppercase tracking-wider text-gray-900 transition duration-150 ease-in-out hover:bg-icyAqua/90 focus:bg-icyAqua/80 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-1 active:bg-gray-900/20 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
