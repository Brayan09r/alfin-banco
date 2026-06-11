"""Cliente de Supabase: instancia única compartida en toda la app.

Se usa supabase-py con la Service Role Key para consultas protegidas
desde el backend (nunca se expone al frontend).
"""
from supabase import create_client, Client
from app.core.cfg_config import settings

supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_KEY,
)
