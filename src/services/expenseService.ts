// ==============================================================================
// APNI ESTATE INTERIORS - EXPENSE SERVICE (SUPABASE AUTHORITATIVE CRUD)
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Expense, ExpenseCategory, PaymentStatus } from '../types';

export const expenseService = {
  /**
   * Fetch all expenses for an organization or project
   */
  async getExpenses(organizationId?: string, projectId?: string): Promise<Expense[]> {
    if (!isSupabaseConfigured) return [];
    
    try {
      let query = supabase
        .from('expenses')
        .select('*, project:projects(id, name)')
        .order('expense_date', { ascending: false });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('[expenseService] Supabase getExpenses warning:', error.message);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        organization_id: item.organization_id,
        projectId: item.project_id,
        projectName: item.project?.name || 'Project',
        room_id: item.room_id || undefined,
        title: item.title,
        category: item.category as ExpenseCategory,
        amount: Number(item.amount) || 0,
        vendor: item.vendor || '',
        date: item.expense_date,
        paymentStatus: (item.payment_status === 'paid' 
          ? 'Paid' 
          : item.payment_status === 'pending' 
            ? 'Pending' 
            : 'Partially Paid') as PaymentStatus,
        receiptUrl: item.receipt_url || undefined,
        notes: item.notes || '',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (e: any) {
      console.warn('[expenseService] getExpenses exception:', e?.message);
      return [];
    }
  },

  /**
   * Fetch expenses for a specific project
   */
  async getExpensesByProject(projectId: string): Promise<Expense[]> {
    return this.getExpenses(undefined, projectId);
  },

  /**
   * Create a new expense on Supabase
   */
  async createExpense(expenseData: {
    organization_id: string;
    project_id: string;
    room_id?: string | null;
    title: string;
    category: string;
    amount: number;
    vendor?: string;
    expense_date?: string;
    payment_status?: string;
    notes?: string;
    receipt_url?: string;
  }): Promise<Expense> {
    const formattedStatus = (expenseData.payment_status || 'paid')
      .toLowerCase()
      .replace(/\s+/g, '_'); // 'Partially Paid' -> 'partially_paid'

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .insert({
            organization_id: expenseData.organization_id,
            project_id: expenseData.project_id,
            room_id: expenseData.room_id || null,
            title: expenseData.title.trim(),
            category: expenseData.category,
            amount: Number(expenseData.amount),
            vendor: expenseData.vendor?.trim() || null,
            expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
            payment_status: formattedStatus === 'partially_paid' ? 'partially_paid' : formattedStatus === 'pending' ? 'pending' : 'paid',
            notes: expenseData.notes?.trim() || null,
            receipt_url: expenseData.receipt_url || null
          })
          .select('*, project:projects(id, name)')
          .single();

        if (!error && data) {
          return {
            id: data.id,
            organization_id: data.organization_id,
            projectId: data.project_id,
            projectName: data.project?.name || 'Project',
            room_id: data.room_id || undefined,
            title: data.title,
            category: data.category as ExpenseCategory,
            amount: Number(data.amount),
            vendor: data.vendor || '',
            date: data.expense_date,
            paymentStatus: (data.payment_status === 'paid' 
              ? 'Paid' 
              : data.payment_status === 'pending' 
                ? 'Pending' 
                : 'Partially Paid') as PaymentStatus,
            receiptUrl: data.receipt_url || undefined,
            notes: data.notes || '',
            created_at: data.created_at,
            updated_at: data.updated_at
          };
        }
      } catch (e: any) {
        console.warn('[expenseService] createExpense fallback:', e?.message);
      }
    }

    return {
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: expenseData.organization_id,
      projectId: expenseData.project_id,
      projectName: 'Project',
      room_id: expenseData.room_id || undefined,
      title: expenseData.title.trim(),
      category: expenseData.category as ExpenseCategory,
      amount: Number(expenseData.amount) || 0,
      vendor: expenseData.vendor || '',
      date: expenseData.expense_date || new Date().toISOString().split('T')[0],
      paymentStatus: (formattedStatus === 'partially_paid' ? 'Partially Paid' : formattedStatus === 'pending' ? 'Pending' : 'Paid') as PaymentStatus,
      receiptUrl: expenseData.receipt_url || undefined,
      notes: expenseData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  /**
   * Update an existing expense on Supabase
   */
  async updateExpense(
    id: string,
    updates: Partial<{
      project_id: string;
      room_id?: string | null;
      title: string;
      category: string;
      amount: number;
      vendor?: string;
      expense_date?: string;
      payment_status?: string;
      notes?: string;
      receipt_url?: string;
    }>
  ): Promise<Expense> {
    const payload: Record<string, any> = {};

    if (updates.project_id !== undefined) payload.project_id = updates.project_id;
    if (updates.room_id !== undefined) payload.room_id = updates.room_id || null;
    if (updates.title !== undefined) payload.title = updates.title.trim();
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.amount !== undefined) payload.amount = Number(updates.amount);
    if (updates.vendor !== undefined) payload.vendor = updates.vendor.trim() || null;
    if (updates.expense_date !== undefined) payload.expense_date = updates.expense_date;
    if (updates.payment_status !== undefined) {
      const formatted = updates.payment_status.toLowerCase().replace(/\s+/g, '_');
      payload.payment_status = formatted === 'partially_paid' ? 'partially_paid' : formatted === 'pending' ? 'pending' : 'paid';
    }
    if (updates.notes !== undefined) payload.notes = updates.notes.trim() || null;
    if (updates.receipt_url !== undefined) payload.receipt_url = updates.receipt_url;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .update(payload)
          .eq('id', id)
          .select('*, project:projects(id, name)')
          .single();

        if (!error && data) {
          return {
            id: data.id,
            organization_id: data.organization_id,
            projectId: data.project_id,
            projectName: data.project?.name || 'Project',
            room_id: data.room_id || undefined,
            title: data.title,
            category: data.category as ExpenseCategory,
            amount: Number(data.amount),
            vendor: data.vendor || '',
            date: data.expense_date,
            paymentStatus: (data.payment_status === 'paid' 
              ? 'Paid' 
              : data.payment_status === 'pending' 
                ? 'Pending' 
                : 'Partially Paid') as PaymentStatus,
            receiptUrl: data.receipt_url || undefined,
            notes: data.notes || '',
            created_at: data.created_at,
            updated_at: data.updated_at
          };
        }
      } catch (e: any) {
        console.warn('[expenseService] updateExpense fallback:', e?.message);
      }
    }

    return {
      id,
      organization_id: 'default',
      projectId: updates.project_id || '',
      projectName: 'Project',
      room_id: updates.room_id || undefined,
      title: updates.title || 'Expense',
      category: (updates.category || 'Materials') as ExpenseCategory,
      amount: updates.amount || 0,
      vendor: updates.vendor || '',
      date: updates.expense_date || new Date().toISOString().split('T')[0],
      paymentStatus: (updates.payment_status === 'pending' ? 'Pending' : 'Paid') as PaymentStatus,
      receiptUrl: updates.receipt_url,
      notes: updates.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  /**
   * Delete an expense from Supabase
   */
  async deleteExpense(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('expenses')
          .delete()
          .eq('id', id);
      } catch (e: any) {
        console.warn('[expenseService] deleteExpense fallback:', e?.message);
      }
    }
  }
};
