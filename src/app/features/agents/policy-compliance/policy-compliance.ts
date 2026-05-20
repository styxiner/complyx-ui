import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ComplianceService } from '../../../core/services/compliance';
import { PolicyComplianceDTO, ElementComplianceDTO, CheckComplianceDTO } from '../../../core/models/compliance.model';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorBanner } from '../../../shared/components/error-banner/error-banner';
import { StatusBadge, StatusVariant } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-policy-compliance',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinner, ErrorBanner, StatusBadge],
  templateUrl: './policy-compliance.html',
  styleUrl:    './policy-compliance.scss',
})
export class PolicyCompliance implements OnInit {
  private svc    = inject(ComplianceService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  agentId  = '';
  policyId = '';

  data    = signal<PolicyComplianceDTO | null>(null);
  loading = signal(false);
  error   = signal(false);

  // Elementos expandidos
  expanded = signal<Set<string>>(new Set());

  ngOnInit() {
    this.agentId  = this.route.snapshot.paramMap.get('id')  ?? '';
    this.policyId = this.route.snapshot.paramMap.get('policyId') ?? '';
    this.load();
  }

  load() {
    this.loading.set(true); this.error.set(false);
    this.svc.getCompliance(this.agentId, this.policyId).subscribe({
      next: (d) => {
        this.data.set(d);
        // Expandir todos los elementos por defecto
        this.expanded.set(new Set(d.elements.map(e => e.elementId)));
        this.loading.set(false);
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  goBack() {
    this.router.navigate(['/agents', this.agentId]);
  }

  toggleElement(id: string) {
    this.expanded.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isExpanded(id: string): boolean { return this.expanded().has(id); }

  // ── Helpers de presentación ───────────────────────────────────────────────

  scoreClass(score: number): string {
    if (score >= 90) return 'score--pass';
    if (score >= 50) return 'score--warn';
    return 'score--fail';
  }

  checkVariant(passed: boolean | null): StatusVariant {
    if (passed === null)  return 'unknown';
    return passed ? 'active' : 'critical';
  }

  checkLabel(passed: boolean | null): string {
    if (passed === null) return 'Pendiente';
    return passed ? 'Cumple' : 'No cumple';
  }

  severityVariant(s: string): StatusVariant {
    return ({ CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low' } as any)[s?.toUpperCase()] ?? 'unknown';
  }

  passedCount(el: ElementComplianceDTO): number {
    return el.checks.filter(c => c.passed === true).length;
  }

  failedCount(el: ElementComplianceDTO): number {
    return el.checks.filter(c => c.passed === false).length;
  }

  pendingCount(el: ElementComplianceDTO): number {
    return el.checks.filter(c => c.passed === null).length;
  }
}