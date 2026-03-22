-- Migration: Create Private Messaging Tables

-- 1. Create the conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure participant_1 is always sorted before participant_2 to prevent duplicate conversations
    CONSTRAINT proper_participant_order CHECK (participant_1_id < participant_2_id),
    -- Prevent a user from messaging themselves
    CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id)
);

-- Index for faster queries on participants
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1_id, participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);

-- 2. Create the private_messages table
CREATE TABLE IF NOT EXISTS public.private_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for retrieving messages by conversation quickly
CREATE INDEX IF NOT EXISTS idx_private_messages_conversation ON public.private_messages(conversation_id, created_at ASC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for conversations
-- Users can see their own conversations
CREATE POLICY "Users can view their own conversations" 
    ON public.conversations FOR SELECT 
    USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Users can create conversations they are a part of
CREATE POLICY "Users can create conversations" 
    ON public.conversations FOR INSERT 
    WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Users can update conversations (e.g. updating last_message_at)
CREATE POLICY "Users can update their conversations" 
    ON public.conversations FOR UPDATE 
    USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- 5. RLS Policies for private_messages
-- Users can read messages in their conversations
CREATE POLICY "Users can read messages in their conversations" 
    ON public.private_messages FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = conversation_id 
            AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
        )
    );

-- Users can send messages to conversations they are a part of
CREATE POLICY "Users can insert messages in their conversations" 
    ON public.private_messages FOR INSERT 
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = conversation_id 
            AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
        )
    );

-- Users can update messages (specifically, marking them as read)
CREATE POLICY "Users can update their received messages" 
    ON public.private_messages FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = conversation_id 
            AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
        )
    );

-- 6. Trigger to update conversation's last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON public.private_messages;
CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON public.private_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_last_message();

-- 7. Grant permissions mapping to Authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.private_messages TO authenticated;
