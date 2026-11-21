// ==============================================================================
// APNI ESTATE INTERIORS - BOQ (BILL OF QUANTITIES) SERVICE
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BOQItem } from '../types';

export const boqService = {
  /**
   * Fetch all BOQ items for an organization or filtered by project
   */
  async getBOQItems(organizationId?: string, projectId?: string): Promise<BOQItem[]> {
    if (!isSupabaseConfigured) return [];

    try {
      let query = supabase
        .from('boq_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('[boqService] Supabase getBOQItems warning:', error.message);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        organization_id: item.organization_id,
        project_id: item.project_id,
        room_id: item.room_id || undefined,
        item_name: item.item_name,
        description: item.description || '',
        category: item.category || 'Civil Work',
        quantity: Number(item.quantity) || 0,
        unit: item.unit || 'Nos',
        rate: Number(item.rate) || 0,
        estimated_cost: Number(item.estimated_cost) || (Number(item.quantity) * Number(item.rate)) || 0,
        material_rate: item.material_rate === null ? undefined : Number(item.material_rate),
        labour_rate: item.labour_rate === null ? undefined : Number(item.labour_rate),
        selling_rate: item.selling_rate === null ? undefined : Number(item.selling_rate),
        gst_percent: Number(item.gst_percent) || 0,
        approved_at: item.approved_at || undefined,
        approved_by: item.approved_by || undefined,
        actual_cost: item.actual_cost ? Number(item.actual_cost) : undefined,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (e: any) {
      console.warn('[boqService] getBOQItems exception:', e?.message);
      return [];
    }
  },

  /**
   * Fetch all BOQ items belonging to a specific room
   */
  async getBOQItemsByRoom(roomId: string): Promise<BOQItem[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('boq_items')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) return [];

      return (data || []).map((item: any) => ({
        id: item.id,
        organization_id: item.organization_id,
        project_id: item.project_id,
        room_id: item.room_id || undefined,
        item_name: item.item_name,
        description: item.description || '',
        category: item.category || 'Civil Work',
        quantity: Number(item.quantity) || 0,
        unit: item.unit || 'Nos',
        rate: Number(item.rate) || 0,
        estimated_cost: Number(item.estimated_cost) || (Number(item.quantity) * Number(item.rate)) || 0,
        material_rate: item.material_rate === null ? undefined : Number(item.material_rate),
        labour_rate: item.labour_rate === null ? undefined : Number(item.labour_rate),
        selling_rate: item.selling_rate === null ? undefined : Number(item.selling_rate),
        gst_percent: Number(item.gst_percent) || 0,
        approved_at: item.approved_at || undefined,
        approved_by: item.approved_by || undefined,
        actual_cost: item.actual_cost ? Number(item.actual_cost) : undefined,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch {
      return [];
    }
  },

  /**
   * Create a new BOQ item on Supabase
   */
  async createBOQItem(itemData: {
    organization_id: string;
    project_id: string;
    room_id?: string | null;
    item_name: string;
    description?: string;
    category?: string;
    quantity: number;
    unit?: string;
    rate: number;
    estimated_cost?: number;
    material_rate?: number;
    labour_rate?: number;
    selling_rate?: number;
    gst_percent?: number;
  }): Promise<BOQItem> {
    const qty = Math.max(0, Number(itemData.quantity) || 0);
    const rate = Math.max(0, Number(itemData.rate) || 0);
    const estimated_cost = itemData.estimated_cost !== undefined ? itemData.estimated_cost : qty * rate;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('boq_items')
          .insert({
            organization_id: itemData.organization_id,
            project_id: itemData.project_id,
            room_id: itemData.room_id || null,
            item_name: itemData.item_name.trim(),
            description: itemData.description?.trim() || null,
            category: itemData.category || 'Civil Work',
            quantity: qty,
            unit: itemData.unit || 'Nos',
            rate: rate,
            estimated_cost: estimated_cost,
            material_rate: itemData.material_rate ?? null,
            labour_rate: itemData.labour_rate ?? null,
            selling_rate: itemData.selling_rate ?? null,
            gst_percent: itemData.gst_percent ?? 0
          })
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            organization_id: data.organization_id,
            project_id: data.project_id,
            room_id: data.room_id || undefined,
            item_name: data.item_name,
            description: data.description || '',
            category: data.category,
            quantity: Number(data.quantity),
            unit: data.unit,
            rate: Number(data.rate),
            estimated_cost: Number(data.estimated_cost),
            material_rate: data.material_rate === null ? undefined : Number(data.material_rate),
            labour_rate: data.labour_rate === null ? undefined : Number(data.labour_rate),
            selling_rate: data.selling_rate === null ? undefined : Number(data.selling_rate),
            gst_percent: Number(data.gst_percent) || 0,
            approved_at: data.approved_at || undefined,
            approved_by: data.approved_by || undefined,
            actual_cost: data.actual_cost ? Number(data.actual_cost) : undefined,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
        }
      } catch (e: any) {
        console.warn('[boqService] createBOQItem fallback:', e?.message);
      }
    }

    return {
      id: `boq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: itemData.organization_id,
      project_id: itemData.project_id,
      room_id: itemData.room_id || undefined,
      item_name: itemData.item_name.trim(),
      description: itemData.description?.trim() || '',
      category: itemData.category || 'Civil Work',
      quantity: qty,
      unit: itemData.unit || 'Nos',
      rate: rate,
      estimated_cost: estimated_cost,
      material_rate: itemData.material_rate,
      labour_rate: itemData.labour_rate,
      selling_rate: itemData.selling_rate,
      gst_percent: itemData.gst_percent || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  /**
   * Update an existing BOQ item
   */
  async updateBOQItem(
    id: string,
    updates: Partial<{
      room_id?: string | null;
      item_name: string;
      description?: string;
      category?: string;
      quantity: number;
      unit?: string;
      rate: number;
      estimated_cost?: number;
      material_rate?: number;
      labour_rate?: number;
      selling_rate?: number;
      gst_percent?: number;
    }>
  ): Promise<BOQItem> {
    const updatePayload: Record<string, any> = { ...updates };

    if (updates.room_id !== undefined) {
      updatePayload.room_id = updates.room_id || null;
    }
    const quantity = updates.quantity !== undefined ? Number(updates.quantity) : 1;
    const costRate = updates.rate !== undefined ? Number(updates.rate) : 0;
    updatePayload.estimated_cost = Number(quantity) * Number(costRate);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('boq_items')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            organization_id: data.organization_id,
            project_id: data.project_id,
            room_id: data.room_id || undefined,
            item_name: data.item_name,
            description: data.description || '',
            category: data.category,
            quantity: Number(data.quantity),
            unit: data.unit,
            rate: Number(data.rate),
            estimated_cost: Number(data.estimated_cost),
            material_rate: data.material_rate === null ? undefined : Number(data.material_rate),
            labour_rate: data.labour_rate === null ? undefined : Number(data.labour_rate),
            selling_rate: data.selling_rate === null ? undefined : Number(data.selling_rate),
            gst_percent: Number(data.gst_percent) || 0,
            approved_at: data.approved_at || undefined,
            approved_by: data.approved_by || undefined,
            actual_cost: data.actual_cost ? Number(data.actual_cost) : undefined,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
        }
      } catch (e: any) {
        console.warn('[boqService] updateBOQItem fallback:', e?.message);
      }
    }

    return {
      id,
      organization_id: 'default',
      project_id: '',
      item_name: updates.item_name || 'Item',
      description: updates.description || '',
      category: updates.category || 'Civil Work',
      quantity: quantity,
      unit: updates.unit || 'Nos',
      rate: costRate,
      estimated_cost: quantity * costRate,
      material_rate: updates.material_rate,
      labour_rate: updates.labour_rate,
      selling_rate: updates.selling_rate,
      gst_percent: updates.gst_percent || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  /**
   * Delete a BOQ item
   */
  async deleteBOQItem(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('boq_items')
          .delete()
          .eq('id', id);
      } catch (e: any) {
        console.warn('[boqService] deleteBOQItem fallback:', e?.message);
      }
    }
  },

  async approveProjectBOQ(projectId: string): Promise<BOQItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.rpc('approve_project_boq', { p_project_id: projectId });
        if (!error) {
          return this.getBOQItems(undefined, projectId);
        }
      } catch (e: any) {
        console.warn('[boqService] approveProjectBOQ fallback:', e?.message);
      }
    }
    return this.getBOQItems(undefined, projectId);
  }
};
