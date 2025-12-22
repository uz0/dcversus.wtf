// Language switching functionality
class LanguageSwitcher {
    private currentLang: string;
    private originalEnglishTitle: string = '';
    private originalEnglishMeta: Map<string, string> = new Map();

    constructor() {
        this.currentLang = this.getLanguageFromURL() || 'en'; // Default to English
        this.storeOriginalContent();
        this.init();
    }

    private storeOriginalContent(): void {
        // Store original English title
        const titleElement = document.querySelector('title');
        if (titleElement) {
            this.originalEnglishTitle = titleElement.textContent;
        }

        // Store original English meta content
        const metaElements = document.querySelectorAll('meta[data-i18n-ru]');
        metaElements.forEach(element => {
            const attributeName = element.getAttribute('name') || element.getAttribute('property') || '';
            const englishContent = element.getAttribute('content');
            if (attributeName && englishContent) {
                this.originalEnglishMeta.set(attributeName, englishContent);
            }
        });
    }

    getLanguageFromURL(): string | null {
        const params = new URLSearchParams(window.location.search);
        const lang = params.get('lang');
        return (lang === 'ru' || lang === 'en') ? lang : null;
    }

    updateLanguageURL(lang: string): void {
        const url = new URL(window.location.href);
        if (lang === 'en') {
            url.searchParams.delete('lang'); // Remove lang parameter for default
        } else {
            url.searchParams.set('lang', lang);
        }

        if (url.searchParams.toString()) {
            window.history.replaceState({}, '', url.pathname + '?' + url.searchParams.toString());
        } else {
            window.history.replaceState({}, '', url.pathname);
        }
    }

    switchLanguage(lang: string): void {
        if (lang !== this.currentLang) {
            this.currentLang = lang;
            this.updateLanguage(lang);
            this.updateLanguageURL(lang);
            this.updateActiveButton(lang);
        }
    }

    updateLanguage(lang: string): void {
        // Find all elements with data attributes
        const elements = document.querySelectorAll('[data-i18n-' + lang + ']');

        elements.forEach(element => {
            const translation = element.getAttribute('data-i18n-' + lang);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Update meta tags and title
        this.updateMetaTags(lang);

        // Update document lang attribute
        document.documentElement.lang = lang;
    }

    updateMetaTags(lang: string): void {
        // Update page title
        const titleElement = document.querySelector('title');
        if (titleElement) {
            const russianTitle = titleElement.getAttribute('data-i18n-ru');

            if (lang === 'ru' && russianTitle) {
                titleElement.textContent = russianTitle;
            } else {
                titleElement.textContent = this.originalEnglishTitle;
            }
        }

        // Update meta tags
        const metaElements = document.querySelectorAll('meta[data-i18n-ru]');
        metaElements.forEach(element => {
            const attributeName = element.getAttribute('name') || element.getAttribute('property') || '';
            const russianContent = element.getAttribute('data-i18n-ru');
            const originalEnglish = this.originalEnglishMeta.get(attributeName);

            if (attributeName && russianContent) {
                if (lang === 'ru') {
                    element.setAttribute('content', russianContent);
                } else if (originalEnglish) {
                    element.setAttribute('content', originalEnglish);
                }
            }
        });

        // Update Open Graph locale
        const localeMeta = document.querySelector('meta[property="og:locale"]');
        if (localeMeta) {
            localeMeta.setAttribute('content', lang === 'ru' ? 'ru_RU' : 'en_US');
        }
    }

    updateActiveButton(lang: string): void {
        const enButton = document.getElementById('lang-en');
        const ruButton = document.getElementById('lang-ru');

        if (enButton && ruButton) {
            // Update visual states
            if (lang === 'en') {
                enButton.style.fontWeight = '700';
                enButton.style.color = '#1e40af'; // darker blue
                ruButton.style.fontWeight = '400';
                ruButton.style.color = '#2563eb'; // normal blue
            } else {
                ruButton.style.fontWeight = '700';
                ruButton.style.color = '#1e40af'; // darker blue
                enButton.style.fontWeight = '400';
                enButton.style.color = '#2563eb'; // normal blue
            }
        }
    }

    init(): void {
        // Set initial language
        this.updateLanguage(this.currentLang);
        this.updateActiveButton(this.currentLang);

        // Add click handlers to language buttons
        const enButton = document.getElementById('lang-en');
        const ruButton = document.getElementById('lang-ru');

        if (enButton) {
            enButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchLanguage('en');
            });
        }

        if (ruButton) {
            ruButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchLanguage('ru');
            });
        }
    }
}

// Initialize language switcher when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LanguageSwitcher();
});

console.log("Language switcher initialized");