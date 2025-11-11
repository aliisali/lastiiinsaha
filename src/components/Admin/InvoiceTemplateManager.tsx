import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function InvoiceTemplateManager() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    template_type: 'standard'
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('business_id', user?.businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('invoice_templates')
        .insert({
          business_id: user?.businessId,
          name: formData.name,
          content: formData.content,
          template_type: formData.template_type,
          is_active: true
        });

      if (error) throw error;

      setFormData({ name: '', content: '', template_type: 'standard' });
      setCreating(false);
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim() || !formData.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('invoice_templates')
        .update({
          name: formData.name,
          content: formData.content,
          template_type: formData.template_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setEditing(null);
      setFormData({ name: '', content: '', template_type: 'standard' });
      loadTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('invoice_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const startEdit = (template: any) => {
    setEditing(template.id);
    setFormData({
      name: template.name,
      content: template.content,
      template_type: template.template_type
    });
    setCreating(false);
  };

  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
    setFormData({ name: '', content: '', template_type: 'standard' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFormData({ ...formData, content });
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice Templates</h2>
          <p className="text-gray-600">Manage your invoice templates for automated invoicing</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Template
        </button>
      </div>

      {(creating || editing) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {creating ? 'Create New Template' : 'Edit Template'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Standard Invoice, Premium Invoice"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Type
              </label>
              <select
                value={formData.template_type}
                onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="standard">Standard</option>
                <option value="detailed">Detailed</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Content *
              </label>
              <div className="mb-2">
                <label className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-fit">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload HTML Template
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                rows={12}
                placeholder="Enter HTML template content with placeholders like {{customerName}}, {{invoiceNumber}}, etc."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => editing ? handleUpdate(editing) : handleCreate()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {creating ? 'Create Template' : 'Update Template'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{template.template_type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                template.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {template.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-3">
                {template.content.substring(0, 150)}...
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => startEdit(template)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !creating && (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Yet</h3>
          <p className="text-gray-600 mb-4">Create your first invoice template to get started</p>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Template
          </button>
        </div>
      )}
    </div>
  );
}
