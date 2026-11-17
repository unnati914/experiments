import React from 'react';
import { Composition } from 'remotion';
import { HiringVideo, TOTAL_FRAMES, FPS } from './Video';
import { HinglishVideo, HinglishPortrait, HINGLISH_FRAMES } from './Hinglish';
import { FinalLandscape, FinalPortrait, FINAL_FRAMES } from './Final';
import { CinemaLandscape, CinemaPortrait, CINEMA_FRAMES } from './Cinema';
import { EvalLandscape, EvalPortrait, EVAL_FRAMES } from './EvalVideo';
import { GrowthLandscape, GrowthPortrait, GROWTH_FRAMES } from './GrowthVideo';
import { EvalLabLandscape, EVALLAB_FRAMES } from './EvalLab';
import { UnderratedLandscape, UNDERRATED_FRAMES } from './Underrated';
import { FailureFiles2, FILES2_FRAMES, FailureFiles2Fast, FILES2_FAST_FRAMES } from './FailureFiles2';
import { FailureFiles3, FILES3_FRAMES, FailureFiles3Fast, FILES3_FAST_FRAMES } from './FailureFiles3';
import { FailureFiles4, FILES4_FRAMES, FailureFiles4Fast, FILES4_FAST_FRAMES } from './FailureFiles4';
import { FailureFiles1, FILES1_FRAMES, FailureFiles1VO, FILES1_VO_FRAMES, FailureFiles1Fast, FILES1_FAST_FRAMES, FailureFiles1Faster, FILES1_FASTER_FRAMES, FailureFiles1Fast2, FILES1_FAST2_FRAMES } from './FailureFiles';
import { FixShort, QuizShort, FlipShort, FixLand, QuizLand, FlipLand, FIX_FRAMES, QUIZ_FRAMES, FLIP_FRAMES } from './Shorts';
import { WaveCute, WAVE_CUTE_FRAMES } from './WaveCute';
import { WaveEvals, WAVE_EVALS_FRAMES } from './WaveEvals';
import { WavePitch, WAVE_PITCH_FRAMES } from './WavePitch';
import { WaveNew, WAVE_NEW_FRAMES } from './WaveNew';
import { WaveDate, WAVE_DATE_FRAMES } from './WaveDate';
import { WaveUnhinged, WAVE_UNHINGED_FRAMES } from './WaveUnhinged';
import { WaveLight, WAVE_LIGHT_FRAMES } from './WaveLight';
import { EmergentPitch, EMERGENT_PITCH_FRAMES } from './EmergentPitch';
import { ProdigalPitch, PRODIGAL_PITCH_FRAMES } from './ProdigalPitch';
import { ProdigalFeatures, PRODIGAL_FEATURES_FRAMES } from './ProdigalFeatures';
import { ProdigalPitchNoExp, PRODIGAL_PITCH_NOEXP_FRAMES } from './ProdigalPitchNoExp';
import { ProdigalFeaturesNoExp, PRODIGAL_FEATURES_NOEXP_FRAMES } from './ProdigalFeaturesNoExp';
import { AgnostFeatures, AGNOST_FEATURES_FRAMES } from './AgnostFeatures';
import { AgnostV3, AGNOST_V3_FRAMES } from './AgnostV3';
import { PramaanaPitch, PRAMAANA_PITCH_FRAMES } from './PramaanaPitch';
import { WaveOutreach, WAVE_OUTREACH_FRAMES } from './WaveOutreach';
import { WaveFull, WAVE_FULL_FRAMES } from './WaveFull';
import { WaveFullDark, WAVE_FULL_DARK_FRAMES } from './WaveFullDark';
import { WaveRec, WAVE_REC_FRAMES } from './WaveRec';
import { FailureFiles1Funny } from './FailureFiles';
import { FailureFiles2Funny } from './FailureFiles2';
import { FailureFiles3Funny } from './FailureFiles3';
import { FailureFiles4Funny } from './FailureFiles4';
import { FailureFiles5, FILES5_FRAMES } from './FailureFiles5';
import { FailureFiles5Cut, FailureFiles5Vertical, FILES5CUT_FRAMES } from './FailureFiles5Cut';
import { CraftPitch, CRAFT_FRAMES } from './CraftPitch';
export const Root: React.FC = () => (
  <>
    <Composition id="CraftPitch" component={CraftPitch} durationInFrames={CRAFT_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="CraftPitchVertical" component={CraftPitch} durationInFrames={CRAFT_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="FailureFiles1Funny" component={FailureFiles1Funny} durationInFrames={FILES1_FAST2_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles2Funny" component={FailureFiles2Funny} durationInFrames={FILES2_FAST_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles3Funny" component={FailureFiles3Funny} durationInFrames={FILES3_FAST_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles4Funny" component={FailureFiles4Funny} durationInFrames={FILES4_FAST_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles5Vertical" component={FailureFiles5Vertical} durationInFrames={FILES5CUT_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="FailureFiles5Cut" component={FailureFiles5Cut} durationInFrames={FILES5CUT_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles5" component={FailureFiles5} durationInFrames={FILES5_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition
      id="HiringVideo"
      component={HiringVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="HinglishVideo"
      component={HinglishVideo}
      durationInFrames={HINGLISH_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="HinglishPortrait"
      component={HinglishPortrait}
      durationInFrames={HINGLISH_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition id="AgnostV3" component={AgnostV3} durationInFrames={AGNOST_V3_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="AgnostFeatures" component={AgnostFeatures} durationInFrames={AGNOST_FEATURES_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="ProdigalFeatures" component={ProdigalFeatures} durationInFrames={PRODIGAL_FEATURES_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="ProdigalFeaturesNoExp" component={ProdigalFeaturesNoExp} durationInFrames={PRODIGAL_FEATURES_NOEXP_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="ProdigalPitch" component={ProdigalPitch} durationInFrames={PRODIGAL_PITCH_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="ProdigalPitchNoExp" component={ProdigalPitchNoExp} durationInFrames={PRODIGAL_PITCH_NOEXP_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FinalLandscape" component={FinalLandscape} durationInFrames={FINAL_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FinalPortrait" component={FinalPortrait} durationInFrames={FINAL_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="CinemaLandscape" component={CinemaLandscape} durationInFrames={CINEMA_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="CinemaPortrait" component={CinemaPortrait} durationInFrames={CINEMA_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="EvalPortrait" component={EvalPortrait} durationInFrames={EVAL_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="EvalLandscape" component={EvalLandscape} durationInFrames={EVAL_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="GrowthPortrait" component={GrowthPortrait} durationInFrames={GROWTH_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="GrowthLandscape" component={GrowthLandscape} durationInFrames={GROWTH_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="EvalLab" component={EvalLabLandscape} durationInFrames={EVALLAB_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="Underrated" component={UnderratedLandscape} durationInFrames={UNDERRATED_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FixShort" component={FixShort} durationInFrames={FIX_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="QuizShort" component={QuizShort} durationInFrames={QUIZ_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="FlipShort" component={FlipShort} durationInFrames={FLIP_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="FixLand" component={FixLand} durationInFrames={FIX_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="QuizLand" component={QuizLand} durationInFrames={QUIZ_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FlipLand" component={FlipLand} durationInFrames={FLIP_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles1" component={FailureFiles1} durationInFrames={FILES1_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles1VO" component={FailureFiles1VO} durationInFrames={FILES1_VO_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles1Fast" component={FailureFiles1Fast} durationInFrames={FILES1_FAST_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles1Faster" component={FailureFiles1Faster} durationInFrames={FILES1_FASTER_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles2" component={FailureFiles2} durationInFrames={FILES2_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles3" component={FailureFiles3} durationInFrames={FILES3_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles4" component={FailureFiles4} durationInFrames={FILES4_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles3Fast" component={FailureFiles3Fast} durationInFrames={FILES3_FAST_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles4Fast" component={FailureFiles4Fast} durationInFrames={FILES4_FAST_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles1Fast2" component={FailureFiles1Fast2} durationInFrames={FILES1_FAST2_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FailureFiles2Fast" component={FailureFiles2Fast} durationInFrames={FILES2_FAST_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="WaveCute" component={WaveCute} durationInFrames={WAVE_CUTE_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="WaveEvals" component={WaveEvals} durationInFrames={WAVE_EVALS_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="WavePitch" component={WavePitch} durationInFrames={WAVE_PITCH_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="WaveNew" component={WaveNew} durationInFrames={WAVE_NEW_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="WaveDate" component={WaveDate} durationInFrames={WAVE_DATE_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="WaveUnhinged" component={WaveUnhinged} durationInFrames={WAVE_UNHINGED_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="WaveLight" component={WaveLight} durationInFrames={WAVE_LIGHT_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="WaveOutreach" component={WaveOutreach} durationInFrames={WAVE_OUTREACH_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="WaveFull" component={WaveFull} durationInFrames={WAVE_FULL_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="WaveFullDark" component={WaveFullDark} durationInFrames={WAVE_FULL_DARK_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="EmergentPitch" component={EmergentPitch} durationInFrames={EMERGENT_PITCH_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="PramaanaPitch" component={PramaanaPitch} durationInFrames={PRAMAANA_PITCH_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="WaveRec" component={WaveRec} durationInFrames={WAVE_REC_FRAMES} fps={FPS} width={1920} height={1080} />
  </>
);
