-- Trigger-Funktion für Party gelöscht Benachrichtigungen
CREATE OR REPLACE FUNCTION public.send_party_deleted_notifications()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message)
  SELECT
    a.user_id,
    'party_deleted',
    'Party gelöscht: ' || OLD.title,
    'Die Party "' || OLD.title || '" wurde gelöscht.'
  FROM
    public.attendees a
  WHERE
    a.party_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für Party gelöscht
DROP TRIGGER IF EXISTS on_party_deleted ON public.parties;
CREATE TRIGGER on_party_deleted
AFTER DELETE ON public.parties
FOR EACH ROW
EXECUTE FUNCTION public.send_party_deleted_notifications();

-- Trigger-Funktion für neue Anmeldungen Benachrichtigungen
CREATE OR REPLACE FUNCTION public.send_new_attendee_notifications()
RETURNS trigger AS $$
DECLARE
  party_owner_id uuid;
  party_title text;
  attendee_name text;
BEGIN
  -- Get party owner ID and party title
  SELECT created_by, title INTO party_owner_id, party_title
  FROM public.parties
  WHERE id = NEW.party_id;

  -- Get attendee name
  SELECT name INTO attendee_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Insert notification for the party owner
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    party_owner_id,
    'new_attendee',
    'Neue Anmeldung für Ihre Party',
    COALESCE(attendee_name, 'Ein Benutzer') || ' hat sich für Ihre Party "' || party_title || '" angemeldet.'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für neue Anmeldungen
DROP TRIGGER IF EXISTS on_new_attendee ON public.attendees;
CREATE TRIGGER on_new_attendee
AFTER INSERT ON public.attendees
FOR EACH ROW
EXECUTE FUNCTION public.send_new_attendee_notifications(); 