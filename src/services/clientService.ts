import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Client } from '../types';

export const clientService = {
  async getClients(organizationId?: string): Promise<Client[]> {
    if (!isSupabaseConfigured) return [];
    
    try {
      let query = supabase
        .from('clients')
        .select(`
          *,
          projects (
            id,
            name,
            budget,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }
      
      const { data, error } = await query;
      if (error) {
        console.warn('[clientService] Supabase getClients warning:', error.message);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        organization_id: item.organization_id,
        name: item.name,
        phone: item.phone || '',
        email: item.email || '',
        address: item.address || '',
        notes: item.notes || '',
        created_at: item.created_at,
        updated_at: item.updated_at,
        projectCount: item.projects?.length || 0,
        totalBudget: item.projects?.reduce((acc: number, p: any) => acc + (Number(p.budget) || 0), 0) || 0,
        latestProject: item.projects?.[0]?.name || undefined
      }));
    } catch (e: any) {
      console.warn('[clientService] getClients exception:', e?.message);
      return [];
    }
  },

  async getClientById(id: string): Promise<Client | null> {
    if (!isSupabaseConfigured) return null;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          projects (
            id,
            name,
            budget,
            status,
            deadline
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) return null;
      return data;
    } catch {
      return null;
    }
  },

  async createClient(clientData: {
    organization_id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }): Promise<Client> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .insert({
            organization_id: clientData.organization_id,
            name: clientData.name.trim(),
            phone: clientData.phone?.trim() || null,
            email: clientData.email?.trim() || null,
            address: clientData.address?.trim() || null,
            notes: clientData.notes?.trim() || null
          })
          .select()
          .single();

        if (!error && data) return data;
      } catch (e: any) {
        console.warn('[clientService] createClient fallback:', e?.message);
      }
    }
    
    return {
      id: `client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: clientData.organization_id,
      name: clientData.name.trim(),
      phone: clientData.phone?.trim() || '',
      email: clientData.email?.trim() || '',
      address: clientData.address?.trim() || '',
      notes: clientData.notes?.trim() || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  async updateClient(id: string, updates: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }): Promise<Client> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .update({
            ...(updates.name && { name: updates.name.trim() }),
            ...(updates.phone !== undefined && { phone: updates.phone?.trim() || null }),
            ...(updates.email !== undefined && { email: updates.email?.trim() || null }),
            ...(updates.address !== undefined && { address: updates.address?.trim() || null }),
            ...(updates.notes !== undefined && { notes: updates.notes?.trim() || null }),
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) return data;
      } catch (e: any) {
        console.warn('[clientService] updateClient fallback:', e?.message);
      }
    }

    return {
      id,
      organization_id: 'default',
      name: updates.name || 'Client',
      phone: updates.phone || '',
      email: updates.email || '',
      address: updates.address || '',
      notes: updates.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  async deleteClient(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('clients')
          .delete()
          .eq('id', id);
      } catch (e: any) {
        console.warn('[clientService] deleteClient fallback:', e?.message);
      }
    }
  }
};
