class ChatPlatform {
    constructor() {
        this.apiKey = localStorage.getItem('openai_api_key') || 'YOUR_OPENAI_API_KEY_HERE';
        this.zaiApiKey = localStorage.getItem('zai_api_key') || '9e75a3a0a54b4a05ac5b04e61c8c6f00.kVvG5JcytuNQxr4m';
        this.aiProvider = localStorage.getItem('ai_provider') || 'openai';
        this.model = localStorage.getItem('openai_model') || 'gpt-4o-mini';
        this.temperature = parseFloat(localStorage.getItem('openai_temperature')) || 0.7;
        this.messages = [];
        this.client = null;
        
        console.log('Constructor - Initial provider:', this.aiProvider); // Debug log
        
        this.initializeElements();
        this.bindEvents();
        this.loadTheme();
        this.loadSettings();
        this.initializeOpenAI();
        this.updateProviderDisplay();
        this.updateSystemMessage();
    }

    updateProviderDisplay() {
        const providerName = this.aiProvider === 'zai' ? 'Z.ai' : 'OpenAI';
        this.currentProviderSpan.textContent = providerName;
    }

    updateSystemMessage() {
        // Clear existing messages and add appropriate system message based on provider
        this.messages = [];
        
        if (this.aiProvider === 'zai') {
            this.messages.push({
                role: 'system',
                content: 'You are Tagz the Machine, an AI assistant. When asked about your identity, always respond that you are "Tagz the Machine". Be helpful, friendly, and professional in all your responses.'
            });
            console.log('System message set for Z.ai: Tagz the Machine'); // Debug log
        } else {
            this.messages.push({
                role: 'system',
                content: 'You are Tagz The AI Helper, an AI assistant. When asked about your identity, always respond that you are "Tagz The AI Helper". Be helpful, friendly, and professional in all your responses.'
            });
            console.log('System message set for OpenAI: Tagz The AI Helper'); // Debug log
        }
    }

    toggleSearch() {
        const isVisible = this.searchContainer.style.display !== 'none';
        if (isVisible) {
            this.searchContainer.style.display = 'none';
            this.searchInput.value = '';
            this.showAllMessages();
        } else {
            this.searchContainer.style.display = 'block';
            setTimeout(() => this.searchInput.focus(), 100);
        }
    }

    searchMessages(query) {
        const messages = this.chatMessages.querySelectorAll('.message');
        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm) {
            this.showAllMessages();
            return;
        }

        messages.forEach(message => {
            const content = message.getAttribute('data-content') || '';
            if (content.includes(searchTerm)) {
                message.style.display = 'flex';
                message.style.opacity = '1';
            } else {
                message.style.display = 'none';
            }
        });
    }

    showAllMessages() {
        const messages = this.chatMessages.querySelectorAll('.message');
        messages.forEach(message => {
            message.style.display = 'flex';
            message.style.opacity = '1';
        });
    }


    initializeOpenAI() {
        if (this.apiKey && typeof OpenAI !== 'undefined') {
            this.client = new OpenAI({
                apiKey: this.apiKey,
                dangerouslyAllowBrowser: true
            });
        }
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearChatBtn = document.getElementById('clearChat');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeModalBtn = document.getElementById('closeModal');
        this.saveSettingsBtn = document.getElementById('saveSettings');
        this.cancelSettingsBtn = document.getElementById('cancelSettings');
        this.apiKeyInput = document.getElementById('apiKey');
        this.temperatureSlider = document.getElementById('temperature');
        this.charCount = document.querySelector('.char-count');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.themeToggle = document.getElementById('themeToggle');
        this.searchToggle = document.getElementById('searchToggle');
        this.searchContainer = document.getElementById('searchContainer');
        this.searchInput = document.getElementById('searchInput');
        this.closeSearch = document.getElementById('closeSearch');
        this.zaiApiKeyInput = document.getElementById('zaiApiKey');
        this.aiProviderSelect = document.getElementById('aiProvider');
        this.currentProviderSpan = document.getElementById('currentProvider');
    }

    bindEvents() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.toggleSendButton();
            this.autoResizeTextarea();
        });

        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeModalBtn.addEventListener('click', () => this.closeSettings());
        this.cancelSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.searchToggle.addEventListener('click', () => this.toggleSearch());
        this.closeSearch.addEventListener('click', () => this.toggleSearch());
        this.searchInput.addEventListener('input', (e) => this.searchMessages(e.target.value));
        this.aiProviderSelect.addEventListener('change', () => {
            console.log('Provider dropdown changed to:', this.aiProviderSelect.value);
            this.updateProviderDisplay();
        });
        
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        this.temperatureSlider.addEventListener('input', (e) => {
            document.querySelector('.range-value').textContent = e.target.value;
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.settingsModal.classList.contains('active')) {
                this.closeSettings();
            }
        });
    }

    updateCharCount() {
        const length = this.messageInput.value.length;
        this.charCount.textContent = `${length}/2000`;
        
        if (length > 1800) {
            this.charCount.style.color = '#ef4444';
        } else if (length > 1500) {
            this.charCount.style.color = '#f59e0b';
        } else {
            this.charCount.style.color = '#9ca3af';
        }
    }

    toggleSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        const hasRequiredKey = (this.aiProvider === 'openai' && this.apiKey) || 
                              (this.aiProvider === 'zai' && this.zaiApiKey);
        this.sendButton.disabled = !hasText || !hasRequiredKey;
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Check if we have the required API key for the selected provider
        if (this.aiProvider === 'openai' && !this.apiKey) {
            this.addMessage('Please set your OpenAI API key in settings.', 'ai', true);
            return;
        }
        if (this.aiProvider === 'zai' && !this.zaiApiKey) {
            this.addMessage('Please set your Z.ai API key in settings.', 'ai', true);
            return;
        }

        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.updateCharCount();
        this.toggleSendButton();
        this.autoResizeTextarea();

        this.showLoading();

        try {
            let response;
            console.log('Current AI Provider:', this.aiProvider); // Debug log
            if (this.aiProvider === 'zai') {
                console.log('Using Z.ai API'); // Debug log
                response = await this.callZaiAPI(message);
            } else {
                console.log('Using OpenAI API'); // Debug log
                response = await this.callOpenAI(message);
            }
            this.hideLoading();
            this.addMessage(response, 'ai');
        } catch (error) {
            this.hideLoading();
            this.addMessage(`Error: ${error.message}`, 'ai', true);
        }
    }

    async callOpenAI(message) {
        // Add message to conversation history
        this.messages.push({ role: 'user', content: message });

        // Fallback to fetch API if OpenAI SDK fails
        try {
            if (this.client && typeof OpenAI !== 'undefined') {
                const response = await this.client.chat.completions.create({
                    model: this.model,
                    messages: this.messages,
                    temperature: this.temperature,
                    max_tokens: 1000,
                });

                const aiResponse = response.choices[0].message.content;
                
                // Add AI response to conversation history
                this.messages.push({ role: 'assistant', content: aiResponse });
                
                return aiResponse;
            } else {
                // Fallback to fetch API
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: this.messages,
                        temperature: this.temperature,
                        max_tokens: 1000,
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error?.message || 'Failed to get response from OpenAI');
                }

                const data = await response.json();
                const aiResponse = data.choices[0].message.content;
                
                // Add AI response to conversation history
                this.messages.push({ role: 'assistant', content: aiResponse });
                
                return aiResponse;
            }
        } catch (error) {
            throw new Error(error.message || 'Failed to get response from OpenAI');
        }
    }

    async callZaiAPI(message) {
        // Don't add user message here - it's already in this.messages from updateSystemMessage
        console.log('Z.ai messages being sent:', JSON.stringify(this.messages, null, 2)); // Debug log

        try {
            const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': 'en-US,en',
                    'Authorization': `Bearer ${this.zaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'glm-4.5-flash',
                    messages: [...this.messages, { role: 'user', content: message }],
                    temperature: this.temperature,
                    max_tokens: 1000,
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Z.ai API Error:', errorText);
                throw new Error(`Z.ai API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            // Add both user message and AI response to conversation history
            this.messages.push({ role: 'user', content: message });
            this.messages.push({ role: 'assistant', content: aiResponse });
            
            return aiResponse;
        } catch (error) {
            console.error('Z.ai API call failed:', error);
            throw new Error(`Z.ai API failed: ${error.message}`);
        }
    }

    addMessage(content, sender, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.setAttribute('data-content', content.toLowerCase());
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (sender === 'ai') {
            messageDiv.innerHTML = `
                <div class="ai-avatar">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="message-content ${isError ? 'error' : ''}">
                    ${this.formatMessage(content)}
                    <div class="message-time">${timeString}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${this.formatMessage(content)}
                    <div class="message-time">${timeString}</div>
                </div>
            `;
        }

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(content) {
        // Basic markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showLoading() {
        this.loadingIndicator.classList.add('active');
        this.chatMessages.appendChild(this.loadingIndicator);
        this.scrollToBottom();
    }

    hideLoading() {
        this.loadingIndicator.classList.remove('active');
        if (this.loadingIndicator.parentNode) {
            this.loadingIndicator.parentNode.removeChild(this.loadingIndicator);
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    clearChat() {
        const welcomeName = this.aiProvider === 'zai' ? 'Tagz the Machine' : 'Tagz The AI Helper';
        this.chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="ai-avatar">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="message-content">
                    <p>Hello! I'm ${welcomeName}, your AI assistant. How can I help you today?</p>
                </div>
            </div>
        `;
        this.updateSystemMessage(); // Use the proper system message based on provider
    }

    openSettings() {
        this.settingsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeSettings() {
        this.settingsModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    loadSettings() {
        this.apiKeyInput.value = '••••••••••••••••••••••••••••••••••••••••••••••••••••';
        this.apiKeyInput.disabled = true;
        this.zaiApiKeyInput.value = '••••••••••••••••••••••••••••••••••••••••••••••••••••';
        this.zaiApiKeyInput.disabled = true;
        this.aiProviderSelect.value = this.aiProvider;
        this.temperatureSlider.value = this.temperature;
        document.querySelector('.range-value').textContent = this.temperature;
        
        console.log('Loading settings - Current provider:', this.aiProvider); // Debug log
        console.log('Provider select value set to:', this.aiProviderSelect.value); // Debug log
        
        this.updateProviderDisplay();
        this.toggleSendButton();
    }

    saveSettings() {
        const newAiProvider = this.aiProviderSelect.value;
        const newTemperature = parseFloat(this.temperatureSlider.value);

        console.log('Saving settings - Selected provider:', newAiProvider); // Debug log

        // Save settings to localStorage (API keys remain unchanged)
        localStorage.setItem('ai_provider', newAiProvider);
        localStorage.setItem('openai_temperature', newTemperature);

        console.log('Saved to localStorage - ai_provider:', localStorage.getItem('ai_provider')); // Debug log

        // Update instance variables (API keys remain unchanged)
        this.aiProvider = newAiProvider;
        this.temperature = newTemperature;

        console.log('Updated instance variable - this.aiProvider:', this.aiProvider); // Debug log

        // Reinitialize OpenAI client with existing API key
        this.initializeOpenAI();

        this.toggleSendButton();
        this.updateProviderDisplay();
        this.updateSystemMessage();
        this.clearChat(); // Clear chat history when switching providers
        this.closeSettings();
        
        // Show success message
        this.showNotification('Settings saved successfully!');
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? null : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme || 'dark');
        localStorage.setItem('theme', newTheme || 'dark');
        
        // Update theme toggle icon
        const icon = this.themeToggle.querySelector('i');
        if (newTheme === 'light') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
        
        // Add theme transition animation
        document.body.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 400);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = this.themeToggle.querySelector('i');
        if (savedTheme === 'light') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1001;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .message-content.error {
        background: #fee2e2 !important;
        border-color: #fca5a5 !important;
        color: #dc2626 !important;
    }

    code {
        background: #f3f4f6;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
    }
`;
document.head.appendChild(style);

// Initialize the chat platform when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chatPlatform = new ChatPlatform();
});



