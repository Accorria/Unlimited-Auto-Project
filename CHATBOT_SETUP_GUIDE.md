# 🤖 Chatbot Setup Guide

## Overview

Your dealership website now has an AI-powered chatbot that can:
- ✅ Help customers find vehicles
- ✅ Answer questions about inventory, pricing, and financing
- ✅ Schedule appointments and test drives
- ✅ Capture leads automatically
- ✅ Answer FAQs about your dealership

## Technology Stack

- **Vercel AI SDK** - Modern AI integration framework
- **OpenAI GPT-4o-mini** - Fast, cost-effective AI model
- **Next.js App Router** - Server-side API routes
- **React** - Chat UI component

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the API key (starts with `sk-...`)

### 2. Configure Environment Variables

Add the OpenAI API key to your environment variables:

**For Local Development:**
Create or update `.env.local`:
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**For Vercel Deployment:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key
   - **Environment:** Production, Preview, Development (select all)
4. Click **Save**

### 3. Install Dependencies

Dependencies are already installed, but if you need to reinstall:
```bash
npm install ai @ai-sdk/openai @ai-sdk/react
```

**Note:** The `@ai-sdk/react` package is required for the React hooks (`useChat`).

### 4. Test the Chatbot

1. Start your development server:
```bash
npm run dev
```

2. Open your website in a browser
3. Look for the blue chat button in the bottom-right corner
4. Click it to open the chat window
5. Try asking:
   - "Show me available vehicles"
   - "What vehicles do you have under $20,000?"
   - "I'm looking for a Toyota"
   - "How do I schedule a test drive?"

## Cost Estimation

**OpenAI GPT-4o-mini Pricing:**
- **Input:** $0.15 per 1M tokens
- **Output:** $0.60 per 1M tokens

**Estimated Monthly Cost:**
- **Low traffic (100 chats/month):** ~$1-2
- **Medium traffic (1,000 chats/month):** ~$5-10
- **High traffic (10,000 chats/month):** ~$50-100

**Note:** Each chat message is typically 100-500 tokens, so costs are very low.

## Features

### ✅ Vehicle Search
The chatbot can search your inventory and answer questions like:
- "What vehicles do you have?"
- "Show me Toyotas under $20,000"
- "Do you have any SUVs?"
- "What's the cheapest car you have?"

### ✅ Pricing & Financing
Answers questions about:
- Vehicle prices
- Down payment options
- Financing availability
- Credit application process

### ✅ Appointment Scheduling
When customers want to schedule:
- Collects name, phone, email
- Asks for preferred date/time
- Creates a lead in your system
- Sends email notification

### ✅ Lead Capture
Automatically captures leads when customers:
- Ask about specific vehicles
- Request test drives
- Show interest in financing
- Ask about appointments

## Customization

### Change the AI Model

Edit `src/app/api/chat/route.ts`:
```typescript
// Current: GPT-4o-mini (fast, cost-effective)
model: openai('gpt-4o-mini'),

// Alternative options:
// model: openai('gpt-4o'), // More capable, higher cost
// model: openai('gpt-3.5-turbo'), // Older, cheaper
```

### Customize System Prompt

Edit the `systemPrompt` in `src/app/api/chat/route.ts` to change:
- Tone and personality
- Information provided
- Response style
- Business rules

### Customize Chat UI

Edit `src/components/ChatBot.tsx` to change:
- Colors and styling
- Chat window size
- Button placement
- Quick action buttons

## Troubleshooting

### Chat Not Responding

1. **Check API Key:**
   - Verify `OPENAI_API_KEY` is set in environment variables
   - Check Vercel dashboard if deployed

2. **Check Console:**
   - Open browser DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed API calls

3. **Check Server Logs:**
   - Check terminal where `npm run dev` is running
   - Look for error messages

### API Errors

**Error: "Invalid API Key"**
- Verify your OpenAI API key is correct
- Check if API key has proper permissions
- Ensure key starts with `sk-`

**Error: "Rate limit exceeded"**
- You've hit OpenAI rate limits
- Upgrade your OpenAI plan or wait
- Consider caching responses

**Error: "Model not found"**
- Check if model name is correct
- Verify your OpenAI account has access to the model

### Chat Button Not Showing

1. Check if `ChatBot` component is imported in `src/app/layout.tsx`
2. Verify component is rendered in the layout
3. Check browser console for React errors

## Integration with Existing Systems

### Lead Capture
The chatbot integrates with your existing lead system:
- Creates leads via `/api/leads` endpoint
- Sets source as `'chatbot'`
- Includes appointment information
- Triggers email notifications

### Vehicle Inventory
The chatbot reads from your vehicle database:
- Fetches available vehicles automatically
- Includes pricing, mileage, condition
- Updates in real-time as inventory changes

## Next Steps

1. ✅ **Set up OpenAI API key** (required)
2. ✅ **Test the chatbot** on your website
3. ✅ **Monitor usage** in OpenAI dashboard
4. ✅ **Customize responses** to match your brand
5. ✅ **Train staff** on how to use chat data

## Support

If you encounter issues:
1. Check this guide first
2. Review OpenAI API documentation
3. Check Vercel AI SDK documentation
4. Review server logs for errors

---

**Status:** ✅ Chatbot is ready to use once OpenAI API key is configured!

