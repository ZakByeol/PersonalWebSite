import { useMemo } from 'react';
 
 interface MarkdownRendererProps {
   content: string;
   attachments?: string[];
 }
 
 export default function MarkdownRenderer({ content, attachments }: MarkdownRendererProps) {
   const renderedHTML = useMemo(() => {
     if (!content) return '';
     
     // Resolve attachment short URLs if attachments list is provided
     let resolvedContent = content;
     if (attachments && attachments.length > 0) {
       resolvedContent = resolvedContent.replace(/\(attach:(\d+)\)/g, (match, p1) => {
         const idx = parseInt(p1, 10);
         return `(${attachments[idx] || ''})`;
       });
     }
 
     // Extract and preserve HTML tags (like in Velog)
     const preservedTags: string[] = [];
     let html = resolvedContent.replace(/<\/?[a-zA-Z][^>]*>/g, (match) => {
       preservedTags.push(match);
       return `__PRESERVED_HTML_TAG_${preservedTags.length - 1}__`;
     });
 
     // Safely parse simple markdown elements
     html = html
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;');
 
     // Headings (e.g. ### Title)
     html = html.replace(/^### (.*?)$/gm, '<h4 class="text-lg font-bold mt-4 mb-2">$1</h4>');
     html = html.replace(/^## (.*?)$/gm, '<h3 class="text-xl font-bold mt-5 mb-2">$1</h3>');
     html = html.replace(/^# (.*?)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>');
 
     // Bold text (**text**)
     html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
 
     // Italic text (*text*)
     html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
 
     // Code blocks
     html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-neutral-500/10 p-4 rounded-xl font-mono text-xs overflow-x-auto my-4 border border-neutral-500/10">$1</pre>');
     html = html.replace(/`([^`\n]+)`/g, '<code class="bg-neutral-500/10 px-1.5 py-0.5 rounded font-mono text-xs">$1</code>');
 
     // Bullet list items
     html = html.replace(/^\- (.*?)$/gm, '<li class="ml-6 list-disc my-1">$1</li>');
     html = html.replace(/^\* (.*?)$/gm, '<li class="ml-6 list-disc my-1">$1</li>');
 
     // Ordered list items
     html = html.replace(/^\d+\. (.*?)$/gm, '<li class="ml-6 list-decimal my-1">$1</li>');
 
     // Blockquotes
     html = html.replace(/^> (.*?)$/gm, '<blockquote class="border-l-4 border-neutral-400 pl-4 py-1 italic my-3 text-neutral-500">$1</blockquote>');
 
     // Images (![alt](url)) - parsed BEFORE hyperlinks so images don't get eaten by link parser
     html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-xl max-w-full my-4 shadow" referrerPolicy="no-referrer" />');
 
     // Hyperlinks ([text](url))
     html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline hover:opacity-85">$1</a>');
 
     // Horizontal Rule
     html = html.replace(/^\-\-\-$/gm, '<hr class="my-6 border-t border-neutral-500/20" />');
 
     // Split paragraphs based on double line breaks (excluding list tags and headings to avoid nesting)
     const lines = html.split(/\n\n+/);
     const parsedLines = lines.map(line => {
       if (
         line.startsWith('<h') || 
         line.startsWith('<pre') || 
         line.startsWith('<blockquote') || 
         line.startsWith('<li') || 
         line.startsWith('<hr')
       ) {
         return line;
       }
       return `<p class="mb-4 leading-relaxed">${line.replace(/\n/g, '<br />')}</p>`;
     });
 
     const finalHtml = parsedLines.join('\n');
 
     // Restore preserved HTML tags
     return finalHtml.replace(/__PRESERVED_HTML_TAG_(\d+)__/g, (match, p1) => {
       const idx = parseInt(p1, 10);
       return preservedTags[idx] || '';
     });
   }, [content, attachments]);
 
   return (
     <div 
       className="prose prose-neutral max-w-none text-inherit leading-relaxed"
       dangerouslySetInnerHTML={{ __html: renderedHTML }}
     />
   );
 }
