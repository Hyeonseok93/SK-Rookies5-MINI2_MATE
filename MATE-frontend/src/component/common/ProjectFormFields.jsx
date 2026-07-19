import { Autocomplete, Box, Chip, FormLabel, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { TECH_STACK_OPTIONS } from '../../constants/techStacks';
import { inputStyle } from '../../styles/sharedStyles';

export default function ProjectFormFields({ formData, setFormData, dateParts, onChange, onDateChange, years, months, days, currentCount }) {
  const setField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));
  return (
    <>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #EEEEEE', borderTop: '4px solid', borderTopColor: 'primary.main' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}><DescriptionIcon color="primary" /><Typography variant="h6" sx={{ fontWeight: 900 }}>기본 정보</Typography></Stack>
        <Box sx={{ mb: 4 }}>
          <FormLabel sx={labelStyle}>모집 유형 *</FormLabel>
          <Stack direction="row" spacing={2}>
            {['PROJECT', 'STUDY'].map((type) => (
              <Box key={type} onClick={() => setField('category', type)} sx={{ flex: 1, p: 2, borderRadius: 3, cursor: 'pointer', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, borderColor: formData.category === type ? 'primary.main' : '#F3F4F6', bgcolor: formData.category === type ? 'primary.soft' : 'white', color: formData.category === type ? 'primary.main' : '#6B7280' }}>
                {formData.category === type ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
                <Typography sx={{ fontWeight: 800 }}>{type === 'PROJECT' ? '💻 프로젝트' : '📚 스터디'}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
        <FormLabel sx={labelStyle}>제목 *</FormLabel>
        <TextField fullWidth value={formData.title} onChange={onChange('title')} inputProps={{ maxLength: 50 }} placeholder="함께하고 싶은 열정이 느껴지는 제목을 지어주세요! (5글자 이상)" sx={inputStyle} />
      </Paper>
      <Paper elevation={0} sx={paperStyle}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}><GroupAddIcon color="primary" /><Typography variant="h6" sx={{ fontWeight: 900 }}>모집 조건</Typography></Stack>
        <Stack spacing={4}>
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 0.7 }}><FormLabel sx={labelStyle}>모집 인원 *</FormLabel><TextField fullWidth type="number" value={formData.recruitCount} onChange={onChange('recruitCount')} helperText={currentCount !== undefined ? `현재 참여: ${currentCount}명 (본인 포함)` : undefined} placeholder="본인 제외 인원" sx={inputStyle} /></Box>
            <Box sx={{ flex: 1.3 }}><FormLabel sx={labelStyle}>마감 일자 *</FormLabel><Stack direction="row" spacing={1}>
              <TextField select fullWidth value={dateParts.year} onChange={onDateChange('year')} sx={inputStyle}>{years.map((v) => <MenuItem key={v} value={v}>{v}년</MenuItem>)}</TextField>
              <TextField select fullWidth value={dateParts.month} onChange={onDateChange('month')} sx={inputStyle}>{months.map((v) => <MenuItem key={v} value={v}>{v}월</MenuItem>)}</TextField>
              <TextField select fullWidth value={dateParts.day} onChange={onDateChange('day')} sx={inputStyle}>{days.map((v) => <MenuItem key={v} value={v}>{v}일</MenuItem>)}</TextField>
            </Stack></Box>
          </Stack>
          <Box><FormLabel sx={labelStyle}>진행 방식 *</FormLabel><Stack direction="row" sx={{ bgcolor: '#F3F4F6', borderRadius: 3, p: 0.5 }}>{['온라인', '오프라인', '온/오프라인'].map((mode) => <Box key={mode} onClick={() => setField('onOffline', mode)} sx={{ flex: 1, py: 1.5, textAlign: 'center', cursor: 'pointer', borderRadius: 2.5, bgcolor: formData.onOffline === mode ? 'white' : 'transparent', color: formData.onOffline === mode ? 'primary.main' : '#6B7280', fontWeight: 800 }}>{mode}</Box>)}</Stack></Box>
          <Box><FormLabel sx={labelStyle}>기술 스택 *</FormLabel><Autocomplete multiple freeSolo value={formData.techStacks} onChange={(_, value) => setField('techStacks', value.map((item) => typeof item === 'string' ? item : item.inputValue || item))} options={TECH_STACK_OPTIONS} renderInput={(params) => <TextField {...params} placeholder="스택 선택 또는 입력" sx={inputStyle} />} renderTags={(value, getTagProps) => value.map((option, index) => { const { key, ...props } = getTagProps({ index }); return <Chip key={key} label={option} {...props} color="primary" />; })} /></Box>
        </Stack>
      </Paper>
      <Paper elevation={0} sx={paperStyle}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}><CodeIcon color="primary" /><Typography variant="h6" sx={{ fontWeight: 900 }}>상세 소개</Typography></Stack>
        <TextField multiline rows={12} fullWidth value={formData.content} onChange={onChange('content')} inputProps={{ maxLength: 10000 }} placeholder="프로젝트의 목적, 방식, 커리큘럼 등을 자세히 적어주세요. 🚀" sx={inputStyle} />
      </Paper>
    </>
  );
}

const labelStyle = { fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' };
const paperStyle = { p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #EEEEEE' };
