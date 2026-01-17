import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Enhanced Rich Text Component
 * Supports all Notion text formatting options
 */
const RichText = ({ richText }) => {
    if (!richText || richText.length === 0) return null;

    return richText.map((text, index) => {
        let content = text.plain_text;
        let style = {};
        let className = '';

        // Apply annotations
        if (text.annotations.bold) style.fontWeight = '600';
        if (text.annotations.italic) style.fontStyle = 'italic';
        if (text.annotations.strikethrough) style.textDecoration = 'line-through';
        if (text.annotations.underline) {
            style.textDecoration = style.textDecoration
                ? `${style.textDecoration} underline`
                : 'underline';
        }

        // Apply colors
        if (text.annotations.color && text.annotations.color !== 'default') {
            const colorMap = {
                gray: '#9B9A97',
                brown: '#64473A',
                orange: '#D9730D',
                yellow: '#DFAB01',
                green: '#0F7B6C',
                blue: '#0B6E99',
                purple: '#6940A5',
                pink: '#AD1A72',
                red: '#E03E3E',
                gray_background: 'rgba(241, 241, 239, 0.6)',
                brown_background: 'rgba(244, 238, 238, 0.6)',
                orange_background: 'rgba(251, 236, 221, 0.6)',
                yellow_background: 'rgba(251, 243, 219, 0.6)',
                green_background: 'rgba(237, 243, 236, 0.6)',
                blue_background: 'rgba(231, 243, 248, 0.6)',
                purple_background: 'rgba(244, 240, 247, 0.6)',
                pink_background: 'rgba(249, 238, 243, 0.6)',
                red_background: 'rgba(253, 235, 236, 0.6)',
            };

            if (text.annotations.color.includes('background')) {
                style.backgroundColor = colorMap[text.annotations.color];
                style.padding = '0.2em 0.4em';
                style.borderRadius = '3px';
            } else {
                style.color = colorMap[text.annotations.color];
            }
        }

        // Inline code
        if (text.annotations.code) {
            return (
                <code
                    key={index}
                    style={{
                        background: 'rgba(135, 131, 120, 0.15)',
                        color: '#EB5757',
                        padding: '0.2em 0.4em',
                        borderRadius: '3px',
                        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
                        fontSize: '85%',
                        ...style
                    }}
                >
                    {content}
                </code>
            );
        }

        // Links
        if (text.href) {
            return (
                <a
                    key={index}
                    href={text.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: 'inherit',
                        textDecoration: 'underline',
                        textDecorationColor: 'rgba(55, 53, 47, 0.4)',
                        ...style
                    }}
                    className="notion-link"
                >
                    {content}
                </a>
            );
        }

        // Inline equation
        if (text.type === 'equation') {
            return <InlineMath key={index} math={text.equation.expression} />;
        }

        return <span key={index} style={style}>{content}</span>;
    });
};

export default RichText;
