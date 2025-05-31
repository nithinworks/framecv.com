
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1.5rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Satoshi', 'system-ui', 'sans-serif'],
				display: ['Satoshi', 'system-ui', 'sans-serif']
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1.1', letterSpacing: '0.02em' }],
				'sm': ['0.875rem', { lineHeight: '1.2', letterSpacing: '0.01em' }],
				'base': ['1rem', { lineHeight: '1.3', letterSpacing: '0' }],
				'lg': ['1.125rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
				'xl': ['1.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
				'2xl': ['1.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'3xl': ['1.875rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
				'4xl': ['2.25rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
				'5xl': ['3rem', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
				'6xl': ['3.75rem', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
				'7xl': ['4.5rem', { lineHeight: '0.85', letterSpacing: '-0.04em' }],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#ffffff',
					foreground: '#171717',
					50: '#fafafa',
					100: '#f5f5f5',
					200: '#e5e5e5',
					300: '#d4d4d4',
					400: '#a3a3a3',
					500: '#737373',
					600: '#525252',
					700: '#404040',
					800: '#262626',
					900: '#171717'
				},
				secondary: {
					DEFAULT: '#262626',
					foreground: '#ffffff',
				},
				accent: {
					DEFAULT: '#404040',
					foreground: '#ffffff',
				},
				destructive: {
					DEFAULT: '#ef4444',
					foreground: '#ffffff'
				},
				muted: {
					DEFAULT: '#262626',
					foreground: '#a3a3a3'
				},
				card: {
					DEFAULT: '#171717',
					foreground: '#ffffff'
				},
				popover: {
					DEFAULT: '#171717',
					foreground: '#ffffff'
				}
			},
			borderRadius: {
				lg: '0.75rem',
				md: '0.5rem',
				sm: '0.375rem'
			},
			spacing: {
				'18': '4.5rem',
				'22': '5.5rem',
			},
			keyframes: {
				'blur-in': {
					'0%': { 
						filter: 'blur(8px)', 
						opacity: '0', 
						transform: 'translateY(15px) scale(0.98)' 
					},
					'100%': { 
						filter: 'blur(0px)', 
						opacity: '1', 
						transform: 'translateY(0) scale(1)' 
					}
				},
				'fade-up': {
					'0%': { 
						opacity: '0', 
						transform: 'translateY(20px) scale(0.98)' 
					},
					'100%': { 
						opacity: '1', 
						transform: 'translateY(0) scale(1)' 
					}
				},
				'scale-blur': {
					'0%': { 
						opacity: '0', 
						transform: 'scale(0.96)', 
						filter: 'blur(4px)' 
					},
					'100%': { 
						opacity: '1', 
						transform: 'scale(1)', 
						filter: 'blur(0px)' 
					}
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				}
			},
			animation: {
				'blur-in': 'blur-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'scale-blur': 'scale-blur 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'shimmer': 'shimmer 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
