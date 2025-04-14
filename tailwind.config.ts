import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}"
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				ocean: {
					50: '#e6f7ff',
					100: '#b3e6ff',
					200: '#80d4ff',
					300: '#4dc2ff',
					400: '#26b1ff',
					500: '#00a0ff',
					600: '#0080cc',
					700: '#006099',
					800: '#004066',
					900: '#002033',
				},
				coral: {
					50: '#fff0eb',
					100: '#ffd6c7',
					200: '#ffbca3',
					300: '#ffa27f',
					400: '#ff895b',
					500: '#ff6f37',
					600: '#cc592c',
					700: '#994321',
					800: '#662c16',
					900: '#33160b',
				},
				seaweed: {
					50: '#e6fff2',
					100: '#b3ffdb',
					200: '#80ffc4',
					300: '#4dffad',
					400: '#26ff9c',
					500: '#00ff8a',
					600: '#00cc6e',
					700: '#009953',
					800: '#006637',
					900: '#00331c',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'bubble': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'50%': { opacity: '1' },
					'100%': { transform: 'translateY(-100%)', opacity: '0' }
				},
				'wave': {
					'0%': { transform: 'translateX(0) translateY(0)' },
					'50%': { transform: 'translateX(10px) translateY(-5px)' },
					'100%': { transform: 'translateX(0) translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'bubble': 'bubble 8s ease-in-out infinite',
				'wave': 'wave 8s ease-in-out infinite'
			},
			backgroundImage: {
				'ocean-gradient': 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(200, 100%, 95%) 100%)',
				'ocean-pattern': "url('/ocean-pattern.svg')"
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;