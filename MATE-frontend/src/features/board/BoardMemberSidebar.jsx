import { Box, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Avatar from '../../component/common/Avatar';
import { POSITION_OPTIONS } from '../../constants/techStacks';
import { getAssetUrl } from '../../config/runtime';
import { getProfileImage } from '../../utils/apiUtils';

export default function BoardMemberSidebar({ members, canManage, onKick }) {
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === 'OWNER') return -1;
    if (b.role === 'OWNER') return 1;
    return (a.nickname || '').localeCompare(b.nickname || '');
  });

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #EEEEEE', position: 'sticky', top: '100px' }}>
      <Typography variant="caption" sx={{ fontWeight: 900, color: '#D1D5DB', display: 'block', mb: 3, letterSpacing: '0.1em' }}>
        TEAM MEMBERS ({members.length})
      </Typography>
      <Stack spacing={2.5}>
        {sortedMembers.map((member) => (
          <Box key={member.id || member.userId || member.nickname} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar name={member.nickname} size="md" src={getAssetUrl(getProfileImage(member))} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#111827' }}>{member.nickname}</Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>
                  {POSITION_OPTIONS.find((p) => p.value === member.position)?.label || member.position}
                </Typography>
              </Box>
            </Stack>
            {member.role === 'OWNER' ? (
              <Chip label="OWNER" size="small" sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontWeight: 900, fontSize: '0.65rem', borderRadius: 1 }} />
            ) : canManage ? (
              <IconButton size="small" onClick={() => onKick(member)} sx={{ color: '#EF4444', bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' }, borderRadius: 1.5 }}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            ) : null}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
