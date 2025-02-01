import { supabase } from '../config/supabase';

interface TeamMember {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
}

interface TeamInvite {
  id: string;
  email: string;
  role: 'admin' | 'member';
  created_at: string;
  token: string;
  team_id: string;
  status: 'pending' | 'accepted' | 'expired';
}

export async function createTeam(name: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('teams')
    .insert({ name, owner_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCurrentTeam() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return null;

  const { data, error } = await supabase
    .from('users')
    .select(`
      team_id,
      teams:team_id (
        id,
        name,
        owner_id,
        created_at,
        updated_at
      )
    `)
    .eq('id', user.id)
    .single();

  if (error || !data?.teams) return null;
  return data.teams;
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  if (!teamId) return [];
  
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('team_id', teamId);

  if (error) throw error;
  return data || [];
}

export async function getTeamInvites(teamId: string): Promise<TeamInvite[]> {
  if (!teamId) return [];
  
  const { data, error } = await supabase
    .from('team_invites')
    .select('*')
    .eq('team_id', teamId)
    .eq('status', 'pending');

  if (error) throw error;
  return data || [];
}

export async function inviteTeamMember(teamId: string, email: string, role: 'admin' | 'member') {
  try {
    const { data: team } = await supabase
      .from('teams')
      .select('name')
      .eq('id', teamId)
      .single();

    if (!team) throw new Error('Team not found');

    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .insert({
        team_id: teamId,
        email,
        role,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // Send invitation email using Supabase Auth
    const { error: emailError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/invite?token=${invite.token}`,
      data: {
        type: 'team_invite',
        teamName: team.name
      }
    });

    if (emailError) throw emailError;
    return invite;
  } catch (error) {
    console.error('Error inviting team member:', error);
    throw error;
  }
}

export async function acceptInvite(token: string) {
  try {
    const { data, error } = await supabase.rpc('accept_team_invite', {
      p_token: token
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error accepting invite:', error);
    throw error;
  }
}

export async function removeTeamMember(memberId: string, teamId: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ team_id: null, role: null })
      .eq('id', memberId)
      .eq('team_id', teamId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing team member:', error);
    throw error;
  }
}

export async function updateTeamMemberRole(memberId: string, teamId: string, role: 'admin' | 'member') {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', memberId)
      .eq('team_id', teamId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating team member role:', error);
    throw error;
  }
}

export async function deleteInvite(inviteId: string) {
  try {
    const { error } = await supabase.rpc('delete_team_invite', {
      p_invite_id: inviteId
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting invite:', error);
    throw error;
  }
}
