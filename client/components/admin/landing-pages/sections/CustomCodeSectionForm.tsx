'use client';

import { AlertTriangle } from 'lucide-react';

interface CustomCodeSectionFormProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

const EXAMPLE = `<style>
  .promo { padding: 48px 24px; text-align: center; }
  .promo h2 { font-size: 2rem; }
</style>

<div class="promo">
  <h2>Limited Time: 15% Off Bathroom Remodels</h2>
  <form id="promo-form">
    <input name="name" placeholder="Your name" required />
    <input name="phone" placeholder="Phone number" required />
    <button type="submit">Get My Quote</button>
  </form>
</div>

<script>
  document.getElementById('promo-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.target;
    window.TolaLeads.submit({
      name: form.name.value,
      phone: form.phone.value,
      project_type: 'bathroom', // optional — defaults to "other"
    }).then(function () {
      form.outerHTML = '<p>Thanks! We will call you shortly.</p>';
    }).catch(function () {
      alert('Something went wrong — please call us instead.');
    });
  });
</script>`;

export default function CustomCodeSectionForm({ config, onChange }: CustomCodeSectionFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 space-y-1">
          <p>
            This HTML/CSS/JS executes as-is on the live page — the same trust level as having
            admin access to the site. Only paste code you trust.
          </p>
          <p>
            CSS is <strong>not scoped</strong> to this section — broad selectors like{' '}
            <code>body</code>, <code>h1</code>, or <code>*</code> will affect the rest of the
            page. Scope your styles to a unique wrapper class or id.
          </p>
          <p>
            To connect a form to the CRM, call{' '}
            <code>window.TolaLeads.submit({'{'} name, phone, project_type {'}'})</code> from
            your form&apos;s submit handler — it handles the security check and delivers the
            lead into <code>/admin/crm/leads</code> automatically. See the example below.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">HTML / CSS / JS</label>
        <textarea
          value={config.html || ''}
          onChange={(e) => onChange({ ...config, html: e.target.value })}
          rows={16}
          placeholder={EXAMPLE}
          spellCheck={false}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
          Show example (form wired to the CRM)
        </summary>
        <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-xs whitespace-pre-wrap">
          {EXAMPLE}
        </pre>
      </details>
    </div>
  );
}
