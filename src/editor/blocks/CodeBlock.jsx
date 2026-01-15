import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check } from 'lucide-react';
import './BlockStyles.css';

const LANGUAGES = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
    'go', 'rust', 'ruby', 'php', 'sql', 'html', 'css', 'json',
    'yaml', 'markdown', 'bash', 'shell',
];

const CodeBlock = ({ block, onUpdate }) => {
    const [language, setLanguage] = useState(block.content.language || 'javascript');
    const [code, setCode] = useState(block.content.code || '');
    const [copied, setCopied] = useState(false);

    const handleCodeChange = (value) => {
        setCode(value || '');
    };

    const handleBlur = () => {
        if (code !== block.content.code || language !== block.content.language) {
            onUpdate({
                ...block.content,
                code,
                language,
            });
        }
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        onUpdate({
            ...block.content,
            language: newLang,
        });
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="code-block">
            <div className="code-block-header">
                <select value={language} onChange={handleLanguageChange}>
                    {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                    ))}
                </select>
                <button className="copy-button" onClick={handleCopy}>
                    {copied ? (
                        <>
                            <Check size={14} /> Copied!
                        </>
                    ) : (
                        <>
                            <Copy size={14} /> Copy
                        </>
                    )}
                </button>
            </div>
            <Editor
                height="200px"
                language={language}
                value={code}
                onChange={handleCodeChange}
                onBlur={handleBlur}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    lineNumbers: block.content.showLineNumbers !== false ? 'on' : 'off',
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                }}
            />
        </div>
    );
};

export default CodeBlock;
