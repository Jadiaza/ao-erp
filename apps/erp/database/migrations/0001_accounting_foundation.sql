-- A&O ERP · Accounting foundation
-- PostgreSQL migration 0001. Not executed automatically.
-- Tenant context must be set inside each transaction by trusted server code:
-- SET LOCAL app.organization_id = '<authorized-organization-uuid>';

CREATE SCHEMA IF NOT EXISTS ao_accounting;

CREATE OR REPLACE FUNCTION ao_accounting.current_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.organization_id', true), '')::uuid
$$;

CREATE TABLE IF NOT EXISTS ao_accounting.accounting_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  legal_name text NOT NULL,
  tax_identifier text,
  country_code char(2) NOT NULL DEFAULT 'CO',
  accounting_framework text NOT NULL,
  functional_currency char(3) NOT NULL DEFAULT 'COP',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accounting_entities_org_id_unique UNIQUE (organization_id, id),
  CONSTRAINT accounting_entities_name_not_empty CHECK (length(trim(legal_name)) > 0),
  CONSTRAINT accounting_entities_country_code CHECK (country_code ~ '^[A-Z]{2}$'),
  CONSTRAINT accounting_entities_currency_code CHECK (functional_currency ~ '^[A-Z]{3}$')
);

CREATE TABLE IF NOT EXISTS ao_accounting.accounting_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  accounting_entity_id uuid NOT NULL,
  period_code varchar(20) NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  status text NOT NULL DEFAULT 'open',
  closed_at timestamptz,
  closed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accounting_periods_org_id_unique UNIQUE (organization_id, id),
  CONSTRAINT accounting_periods_entity_fk
    FOREIGN KEY (organization_id, accounting_entity_id)
    REFERENCES ao_accounting.accounting_entities (organization_id, id),
  CONSTRAINT accounting_periods_date_order CHECK (starts_on <= ends_on),
  CONSTRAINT accounting_periods_status CHECK (status IN ('open', 'closed', 'locked')),
  CONSTRAINT accounting_periods_code_unique UNIQUE (organization_id, accounting_entity_id, period_code)
);

CREATE TABLE IF NOT EXISTS ao_accounting.accounting_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  accounting_entity_id uuid NOT NULL,
  parent_account_id uuid,
  account_code varchar(32) NOT NULL,
  account_name text NOT NULL,
  account_class smallint NOT NULL,
  account_type text NOT NULL,
  normal_balance char(1) NOT NULL,
  accepts_postings boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accounting_accounts_org_id_unique UNIQUE (organization_id, id),
  CONSTRAINT accounting_accounts_entity_fk
    FOREIGN KEY (organization_id, accounting_entity_id)
    REFERENCES ao_accounting.accounting_entities (organization_id, id),
  CONSTRAINT accounting_accounts_parent_fk
    FOREIGN KEY (organization_id, parent_account_id)
    REFERENCES ao_accounting.accounting_accounts (organization_id, id),
  CONSTRAINT accounting_accounts_code_unique UNIQUE (organization_id, accounting_entity_id, account_code),
  CONSTRAINT accounting_accounts_name_not_empty CHECK (length(trim(account_name)) > 0),
  CONSTRAINT accounting_accounts_class CHECK (account_class BETWEEN 1 AND 9),
  CONSTRAINT accounting_accounts_normal_balance CHECK (normal_balance IN ('D', 'C')),
  CONSTRAINT accounting_accounts_not_self_parent CHECK (parent_account_id IS NULL OR parent_account_id <> id)
);

CREATE TABLE IF NOT EXISTS ao_accounting.cost_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  accounting_entity_id uuid NOT NULL,
  parent_cost_center_id uuid,
  code varchar(32) NOT NULL,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cost_centers_org_id_unique UNIQUE (organization_id, id),
  CONSTRAINT cost_centers_entity_fk
    FOREIGN KEY (organization_id, accounting_entity_id)
    REFERENCES ao_accounting.accounting_entities (organization_id, id),
  CONSTRAINT cost_centers_parent_fk
    FOREIGN KEY (organization_id, parent_cost_center_id)
    REFERENCES ao_accounting.cost_centers (organization_id, id),
  CONSTRAINT cost_centers_code_unique UNIQUE (organization_id, accounting_entity_id, code)
);

CREATE TABLE IF NOT EXISTS ao_accounting.accounting_vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  accounting_entity_id uuid NOT NULL,
  accounting_period_id uuid NOT NULL,
  voucher_number varchar(40) NOT NULL,
  voucher_type varchar(24) NOT NULL,
  voucher_date date NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  reversal_of_voucher_id uuid,
  created_by uuid NOT NULL,
  posted_by uuid,
  posted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accounting_vouchers_org_id_unique UNIQUE (organization_id, id),
  CONSTRAINT accounting_vouchers_entity_fk
    FOREIGN KEY (organization_id, accounting_entity_id)
    REFERENCES ao_accounting.accounting_entities (organization_id, id),
  CONSTRAINT accounting_vouchers_period_fk
    FOREIGN KEY (organization_id, accounting_period_id)
    REFERENCES ao_accounting.accounting_periods (organization_id, id),
  CONSTRAINT accounting_vouchers_reversal_fk
    FOREIGN KEY (organization_id, reversal_of_voucher_id)
    REFERENCES ao_accounting.accounting_vouchers (organization_id, id),
  CONSTRAINT accounting_vouchers_number_unique
    UNIQUE (organization_id, accounting_entity_id, voucher_type, voucher_number),
  CONSTRAINT accounting_vouchers_status CHECK (status IN ('draft', 'posted', 'reversed')),
  CONSTRAINT accounting_vouchers_description_not_empty CHECK (length(trim(description)) > 0),
  CONSTRAINT accounting_vouchers_no_self_reversal
    CHECK (reversal_of_voucher_id IS NULL OR reversal_of_voucher_id <> id)
);

CREATE TABLE IF NOT EXISTS ao_accounting.accounting_voucher_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  voucher_id uuid NOT NULL,
  accounting_account_id uuid NOT NULL,
  line_number integer NOT NULL,
  description text,
  debit_minor bigint NOT NULL DEFAULT 0,
  credit_minor bigint NOT NULL DEFAULT 0,
  cost_center_id uuid,
  project_reference text,
  fund_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accounting_voucher_lines_org_id_unique UNIQUE (organization_id, id),
  CONSTRAINT accounting_voucher_lines_voucher_fk
    FOREIGN KEY (organization_id, voucher_id)
    REFERENCES ao_accounting.accounting_vouchers (organization_id, id),
  CONSTRAINT accounting_voucher_lines_account_fk
    FOREIGN KEY (organization_id, accounting_account_id)
    REFERENCES ao_accounting.accounting_accounts (organization_id, id),
  CONSTRAINT accounting_voucher_lines_cost_center_fk
    FOREIGN KEY (organization_id, cost_center_id)
    REFERENCES ao_accounting.cost_centers (organization_id, id),
  CONSTRAINT accounting_voucher_lines_number_unique UNIQUE (organization_id, voucher_id, line_number),
  CONSTRAINT accounting_voucher_lines_amount_nonnegative CHECK (debit_minor >= 0 AND credit_minor >= 0),
  CONSTRAINT accounting_voucher_lines_one_side_only
    CHECK ((debit_minor > 0 AND credit_minor = 0) OR (credit_minor > 0 AND debit_minor = 0))
);

CREATE INDEX IF NOT EXISTS accounting_periods_entity_dates_idx
  ON ao_accounting.accounting_periods (organization_id, accounting_entity_id, starts_on, ends_on);
CREATE INDEX IF NOT EXISTS accounting_accounts_entity_parent_idx
  ON ao_accounting.accounting_accounts (organization_id, accounting_entity_id, parent_account_id);
CREATE INDEX IF NOT EXISTS accounting_vouchers_entity_date_idx
  ON ao_accounting.accounting_vouchers (organization_id, accounting_entity_id, voucher_date);
CREATE INDEX IF NOT EXISTS accounting_vouchers_period_status_idx
  ON ao_accounting.accounting_vouchers (organization_id, accounting_period_id, status);
CREATE INDEX IF NOT EXISTS accounting_voucher_lines_account_idx
  ON ao_accounting.accounting_voucher_lines (organization_id, accounting_account_id);

-- A posted voucher is immutable. Corrections are represented by a new reversal
-- voucher linked through reversal_of_voucher_id.
CREATE OR REPLACE FUNCTION ao_accounting.prevent_posted_voucher_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status <> 'draft' THEN
    RAISE EXCEPTION 'AO_POSTED_VOUCHER_IMMUTABLE';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$;

DROP TRIGGER IF EXISTS accounting_voucher_immutable_update
  ON ao_accounting.accounting_vouchers;
CREATE TRIGGER accounting_voucher_immutable_update
  BEFORE UPDATE OR DELETE ON ao_accounting.accounting_vouchers
  FOR EACH ROW EXECUTE FUNCTION ao_accounting.prevent_posted_voucher_mutation();

CREATE OR REPLACE FUNCTION ao_accounting.prevent_posted_voucher_line_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  target_voucher_id uuid;
  target_status text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_voucher_id := OLD.voucher_id;
  ELSE
    target_voucher_id := NEW.voucher_id;
  END IF;

  SELECT status INTO target_status
  FROM ao_accounting.accounting_vouchers
  WHERE organization_id = CASE WHEN TG_OP = 'DELETE' THEN OLD.organization_id ELSE NEW.organization_id END
    AND id = target_voucher_id;

  IF target_status IS DISTINCT FROM 'draft' THEN
    RAISE EXCEPTION 'AO_POSTED_VOUCHER_LINES_IMMUTABLE';
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS accounting_voucher_line_immutable
  ON ao_accounting.accounting_voucher_lines;
CREATE TRIGGER accounting_voucher_line_immutable
  BEFORE INSERT OR UPDATE OR DELETE ON ao_accounting.accounting_voucher_lines
  FOR EACH ROW EXECUTE FUNCTION ao_accounting.prevent_posted_voucher_line_mutation();

-- RLS is enabled on every tenant-owned table. The application DB role must not
-- have BYPASSRLS; context is assigned with SET LOCAL inside an authorized txn.
ALTER TABLE ao_accounting.accounting_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ao_accounting.accounting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE ao_accounting.accounting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ao_accounting.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ao_accounting.accounting_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ao_accounting.accounting_voucher_lines ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'accounting_entities',
    'accounting_periods',
    'accounting_accounts',
    'cost_centers',
    'accounting_vouchers',
    'accounting_voucher_lines'
  ]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS tenant_isolation ON ao_accounting.%I',
      table_name
    );
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON ao_accounting.%I USING (organization_id = ao_accounting.current_organization_id()) WITH CHECK (organization_id = ao_accounting.current_organization_id())',
      table_name
    );
  END LOOP;
END;
$$;
