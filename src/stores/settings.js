import { reactive } from 'vue'
import axios from 'axios'

const API_BASE_URL = "http://localhost:5000";

export const settingsStore = reactive({
  privacyBlur: false, // Default to false
  matchResultsBlur: false, // Separate toggle for Match Results
  retentionEnabled: false,
  retentionPeriod: '2 months',
  loading: false,

  async fetchSettings() {
    try {
      this.loading = true;
      const res = await axios.get(`${API_BASE_URL}/api/settings`);
      if (res.data.privacy_blur !== undefined) {
        this.privacyBlur = res.data.privacy_blur;
      }
      if (res.data.match_results_blur !== undefined) {
        this.matchResultsBlur = res.data.match_results_blur;
      }
      if (res.data.retention_enabled !== undefined) {
        this.retentionEnabled = res.data.retention_enabled;
      }
      if (res.data.retention_period !== undefined) {
        this.retentionPeriod = res.data.retention_period;
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      this.loading = false;
    }
  },

  async setPrivacyBlur(value) {
    const previousValue = this.privacyBlur;
    this.privacyBlur = value; // Optimistic update
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/settings/privacy_blur`, 
        { value: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to update setting:', err);
      this.privacyBlur = previousValue; // Rollback
    }
  },

  async setMatchResultsBlur(value) {
    const previousValue = this.matchResultsBlur;
    this.matchResultsBlur = value; // Optimistic update
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/settings/match_results_blur`, 
        { value: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to update setting:', err);
      this.matchResultsBlur = previousValue; // Rollback
    }
  },

  async setRetentionEnabled(value) {
    const previousValue = this.retentionEnabled;
    this.retentionEnabled = value;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/settings/retention_enabled`, 
        { value: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to update retention setting:', err);
      this.retentionEnabled = previousValue;
    }
  },

  async setRetentionPeriod(value) {
    const previousValue = this.retentionPeriod;
    this.retentionPeriod = value;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/settings/retention_period`, 
        { value: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to update retention period:', err);
      this.retentionPeriod = previousValue;
    }
  },

  // Helper to extract numeric months from string like "2 months" or return 1
  get retentionMonths() {
    if (!this.retentionPeriod || this.retentionPeriod.includes('minute')) return 1;
    const match = this.retentionPeriod.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  },

  setRetentionMonths(num) {
    this.setRetentionPeriod(`${num} month${num > 1 ? 's' : ''}`);
  },

  get isTestMode() {
    return this.retentionPeriod === '2 minutes';
  },

  toggleTestMode() {
    if (this.isTestMode) {
      this.setRetentionMonths(2); // Default back to 2 months if turning off test mode
    } else {
      this.setRetentionPeriod('2 minutes');
    }
  },

  async triggerManualCleanup() {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/settings/cleanup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      console.error('Manual cleanup failed:', err);
      throw err;
    }
  },

  togglePrivacyBlur() {
    this.setPrivacyBlur(!this.privacyBlur)
  },

  toggleMatchResultsBlur() {
    this.setMatchResultsBlur(!this.matchResultsBlur)
  },

  toggleRetentionEnabled() {
    this.setRetentionEnabled(!this.retentionEnabled)
  },

  sync() {
    this.fetchSettings();
  }
})

// Initialize settings
settingsStore.fetchSettings();

// Optional: refresh every few minutes or use sockets for real-time
// For now, simple fetch is enough for "Global" feel when navigating


