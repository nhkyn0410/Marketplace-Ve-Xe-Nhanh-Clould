// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'csrf_token_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CsrfTokenResponseDtoOutput extends CsrfTokenResponseDtoOutput {
  @override
  final String csrfToken;

  factory _$CsrfTokenResponseDtoOutput(
          [void Function(CsrfTokenResponseDtoOutputBuilder)? updates]) =>
      (CsrfTokenResponseDtoOutputBuilder()..update(updates))._build();

  _$CsrfTokenResponseDtoOutput._({required this.csrfToken}) : super._();
  @override
  CsrfTokenResponseDtoOutput rebuild(
          void Function(CsrfTokenResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CsrfTokenResponseDtoOutputBuilder toBuilder() =>
      CsrfTokenResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CsrfTokenResponseDtoOutput && csrfToken == other.csrfToken;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, csrfToken.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CsrfTokenResponseDtoOutput')
          ..add('csrfToken', csrfToken))
        .toString();
  }
}

class CsrfTokenResponseDtoOutputBuilder
    implements
        Builder<CsrfTokenResponseDtoOutput, CsrfTokenResponseDtoOutputBuilder> {
  _$CsrfTokenResponseDtoOutput? _$v;

  String? _csrfToken;
  String? get csrfToken => _$this._csrfToken;
  set csrfToken(String? csrfToken) => _$this._csrfToken = csrfToken;

  CsrfTokenResponseDtoOutputBuilder() {
    CsrfTokenResponseDtoOutput._defaults(this);
  }

  CsrfTokenResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _csrfToken = $v.csrfToken;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CsrfTokenResponseDtoOutput other) {
    _$v = other as _$CsrfTokenResponseDtoOutput;
  }

  @override
  void update(void Function(CsrfTokenResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CsrfTokenResponseDtoOutput build() => _build();

  _$CsrfTokenResponseDtoOutput _build() {
    final _$result = _$v ??
        _$CsrfTokenResponseDtoOutput._(
          csrfToken: BuiltValueNullFieldError.checkNotNull(
              csrfToken, r'CsrfTokenResponseDtoOutput', 'csrfToken'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
