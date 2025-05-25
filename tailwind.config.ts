
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
			padding: '1rem',
			screens: {
				'2xl': '1200px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Inter', 'system-ui', 'sans-serif']
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.01em' }],
				'sm': ['0.875rem', { lineHeight: '1.3', letterSpacing: '0.01em' }],
				'base': ['1rem', { lineHeight: '1.4', letterSpacing: '0' }],
				'lg': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
				'xl': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
				'2xl': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
				'3xl': ['1.875rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'4xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
				'5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
				'6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
				'7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#ffffff',
					foreground: '#000000',
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
					DEFAULT: '#f8f8f8',
					foreground: '#171717',
				},
				accent: {
					DEFAULT: '#f1f1f1',
					foreground: '#171717',
				},
				destructive: {
					DEFAULT: '#ef4444',
					foreground: '#ffffff'
				},
				muted: {
					DEFAULT: '#f8f8f8',
					foreground: '#6b7280'
				},
				card: {
					DEFAULT: '#ffffff',
					foreground: '#171717'
				},
				popover: {
					DEFAULT: '#ffffff',
					foreground: '#171717'
				},
				sidebar: {
					DEFAULT: '#ffffff',
					foreground: '#171717',
					primary: '#171717',
					'primary-foreground': '#ffffff',
					accent: '#f8f8f8',
					'accent-foreground': '#171717',
					border: '#e5e5e5',
					ring: '#e5e5e5'
				}
			},
			borderRadius: {
				lg: '0.5rem',
				md: '0.375rem',
				sm: '0.25rem'
			},
			spacing: {
				'18': '4.5rem',
				'22': '5.5rem',
			},
			keyframes: {
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(8px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(8px)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(16px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-down': {
					'0%': { opacity: '0', transform: 'translateY(-16px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				}
			},
			animation: {
				'fade-in': 'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
				'fade-out': 'fade-out 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
				'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
				'slide-down': 'slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
