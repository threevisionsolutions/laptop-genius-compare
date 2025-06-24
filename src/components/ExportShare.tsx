
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, Share, Link, Mail, MessageSquare, FileText } from 'lucide-react';
import { LaptopSpecs } from '../types/laptop';

interface ExportShareProps {
  laptops: LaptopSpecs[];
  aiSummary?: string;
}

const ExportShare: React.FC<ExportShareProps> = ({ laptops, aiSummary }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const { toast } = useToast();

  const generateShareUrl = () => {
    const comparisonData = {
      laptops: laptops.map(l => ({ id: l.id, name: l.name, price: l.price })),
      timestamp: Date.now()
    };
    const encodedData = btoa(JSON.stringify(comparisonData));
    const url = `${window.location.origin}?comparison=${encodedData}`;
    setShareUrl(url);
    return url;
  };

  const handleCopyLink = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Comparison link copied to clipboard.",
      });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleNativeShare = async () => {
    const url = generateShareUrl();
    const shareText = `Check out this laptop comparison: ${laptops.map(l => l.name).join(' vs ')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Laptop Comparison',
          text: shareText,
          url: url
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const generateEmailContent = () => {
    const subject = `Laptop Comparison: ${laptops.map(l => l.name).join(' vs ')}`;
    const body = `Hi there!

I've been comparing these laptops and thought you might find it interesting:

${laptops.map((laptop, index) => `
${index + 1}. ${laptop.name}
   Price: ${laptop.currency}${laptop.price.toLocaleString()}
   CPU: ${laptop.cpu}
   RAM: ${laptop.ram}
   Storage: ${laptop.storage}
   Rating: ${laptop.rating}/5 (${laptop.reviewCount} reviews)
`).join('\n')}

${aiSummary ? `\nAI Summary:\n${aiSummary}\n` : ''}

View the full comparison: ${generateShareUrl()}

Best regards!`;

    setEmailContent(body);
    return { subject, body };
  };

  const handleEmailShare = () => {
    const { subject, body } = generateEmailContent();
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const generatePDFContent = () => {
    // Simple PDF generation using print styles
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laptop Comparison Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .laptop-header { background-color: #f8f9fa; font-weight: bold; }
            .summary { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Laptop Comparison Report</h1>
          <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
          
          <h2>Laptops Compared</h2>
          <table>
            <thead>
              <tr>
                <th>Laptop</th>
                <th>Price</th>
                <th>CPU</th>
                <th>RAM</th>
                <th>Storage</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              ${laptops.map(laptop => `
                <tr>
                  <td class="laptop-header">${laptop.name}</td>
                  <td>${laptop.currency}${laptop.price.toLocaleString()}</td>
                  <td>${laptop.cpu}</td>
                  <td>${laptop.ram}</td>
                  <td>${laptop.storage}</td>
                  <td>${laptop.rating}/5 (${laptop.reviewCount} reviews)</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${aiSummary ? `
            <h2>AI Analysis</h2>
            <div class="summary">
              ${aiSummary.replace(/\n/g, '<br>')}
            </div>
          ` : ''}

          <h2>Detailed Specifications</h2>
          ${laptops.map(laptop => `
            <h3>${laptop.name}</h3>
            <table>
              <tr><td><strong>Brand</strong></td><td>${laptop.brand}</td></tr>
              <tr><td><strong>Price</strong></td><td>${laptop.currency}${laptop.price.toLocaleString()}</td></tr>
              <tr><td><strong>Processor</strong></td><td>${laptop.cpu}</td></tr>
              <tr><td><strong>RAM</strong></td><td>${laptop.ram}</td></tr>
              <tr><td><strong>Storage</strong></td><td>${laptop.storage}</td></tr>
              <tr><td><strong>Display</strong></td><td>${laptop.screen}</td></tr>
              <tr><td><strong>Battery</strong></td><td>${laptop.battery}</td></tr>
              <tr><td><strong>Weight</strong></td><td>${laptop.weight}</td></tr>
              <tr><td><strong>Operating System</strong></td><td>${laptop.os}</td></tr>
              <tr><td><strong>Rating</strong></td><td>${laptop.rating}/5 (${laptop.reviewCount} reviews)</td></tr>
              <tr><td><strong>Seller</strong></td><td>${laptop.seller}</td></tr>
            </table>
          `).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleSocialShare = (platform: string) => {
    const url = generateShareUrl();
    const text = `Check out this laptop comparison: ${laptops.map(l => l.name).join(' vs ')}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Card className="p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Share className="w-5 h-5" />
        Share & Export
      </h3>
      
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleCopyLink}>
          <Link className="w-4 h-4 mr-2" />
          Copy Link
        </Button>
        
        <Button variant="outline" onClick={handleNativeShare}>
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
        
        <Button variant="outline" onClick={handleEmailShare}>
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
        
        <Button variant="outline" onClick={generatePDFContent}>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Social Share
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share on Social Media</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => handleSocialShare('twitter')}>
                Twitter
              </Button>
              <Button variant="outline" onClick={() => handleSocialShare('facebook')}>
                Facebook
              </Button>
              <Button variant="outline" onClick={() => handleSocialShare('linkedin')}>
                LinkedIn
              </Button>
              <Button variant="outline" onClick={() => handleSocialShare('whatsapp')}>
                WhatsApp
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};

export default ExportShare;
