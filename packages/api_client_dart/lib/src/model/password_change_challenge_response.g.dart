// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'password_change_challenge_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PasswordChangeChallengeResponsePasswordChangeRequiredEnum
    _$passwordChangeChallengeResponsePasswordChangeRequiredEnum_true_ =
    const PasswordChangeChallengeResponsePasswordChangeRequiredEnum._('true_');

PasswordChangeChallengeResponsePasswordChangeRequiredEnum
    _$passwordChangeChallengeResponsePasswordChangeRequiredEnumValueOf(
        String name) {
  switch (name) {
    case 'true_':
      return _$passwordChangeChallengeResponsePasswordChangeRequiredEnum_true_;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PasswordChangeChallengeResponsePasswordChangeRequiredEnum>
    _$passwordChangeChallengeResponsePasswordChangeRequiredEnumValues =
    BuiltSet<
        PasswordChangeChallengeResponsePasswordChangeRequiredEnum>(const <PasswordChangeChallengeResponsePasswordChangeRequiredEnum>[
  _$passwordChangeChallengeResponsePasswordChangeRequiredEnum_true_,
]);

Serializer<PasswordChangeChallengeResponsePasswordChangeRequiredEnum>
    _$passwordChangeChallengeResponsePasswordChangeRequiredEnumSerializer =
    _$PasswordChangeChallengeResponsePasswordChangeRequiredEnumSerializer();

class _$PasswordChangeChallengeResponsePasswordChangeRequiredEnumSerializer
    implements
        PrimitiveSerializer<
            PasswordChangeChallengeResponsePasswordChangeRequiredEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'true_': 'true',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'true': 'true_',
  };

  @override
  final Iterable<Type> types = const <Type>[
    PasswordChangeChallengeResponsePasswordChangeRequiredEnum
  ];
  @override
  final String wireName =
      'PasswordChangeChallengeResponsePasswordChangeRequiredEnum';

  @override
  Object serialize(Serializers serializers,
          PasswordChangeChallengeResponsePasswordChangeRequiredEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  PasswordChangeChallengeResponsePasswordChangeRequiredEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      PasswordChangeChallengeResponsePasswordChangeRequiredEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$PasswordChangeChallengeResponse
    extends PasswordChangeChallengeResponse {
  @override
  final PasswordChangeChallengeResponsePasswordChangeRequiredEnum
      passwordChangeRequired;
  @override
  final String passwordChangeToken;
  @override
  final int passwordChangeExpiresIn;

  factory _$PasswordChangeChallengeResponse(
          [void Function(PasswordChangeChallengeResponseBuilder)? updates]) =>
      (PasswordChangeChallengeResponseBuilder()..update(updates))._build();

  _$PasswordChangeChallengeResponse._(
      {required this.passwordChangeRequired,
      required this.passwordChangeToken,
      required this.passwordChangeExpiresIn})
      : super._();
  @override
  PasswordChangeChallengeResponse rebuild(
          void Function(PasswordChangeChallengeResponseBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PasswordChangeChallengeResponseBuilder toBuilder() =>
      PasswordChangeChallengeResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PasswordChangeChallengeResponse &&
        passwordChangeRequired == other.passwordChangeRequired &&
        passwordChangeToken == other.passwordChangeToken &&
        passwordChangeExpiresIn == other.passwordChangeExpiresIn;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, passwordChangeRequired.hashCode);
    _$hash = $jc(_$hash, passwordChangeToken.hashCode);
    _$hash = $jc(_$hash, passwordChangeExpiresIn.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PasswordChangeChallengeResponse')
          ..add('passwordChangeRequired', passwordChangeRequired)
          ..add('passwordChangeToken', passwordChangeToken)
          ..add('passwordChangeExpiresIn', passwordChangeExpiresIn))
        .toString();
  }
}

class PasswordChangeChallengeResponseBuilder
    implements
        Builder<PasswordChangeChallengeResponse,
            PasswordChangeChallengeResponseBuilder> {
  _$PasswordChangeChallengeResponse? _$v;

  PasswordChangeChallengeResponsePasswordChangeRequiredEnum?
      _passwordChangeRequired;
  PasswordChangeChallengeResponsePasswordChangeRequiredEnum?
      get passwordChangeRequired => _$this._passwordChangeRequired;
  set passwordChangeRequired(
          PasswordChangeChallengeResponsePasswordChangeRequiredEnum?
              passwordChangeRequired) =>
      _$this._passwordChangeRequired = passwordChangeRequired;

  String? _passwordChangeToken;
  String? get passwordChangeToken => _$this._passwordChangeToken;
  set passwordChangeToken(String? passwordChangeToken) =>
      _$this._passwordChangeToken = passwordChangeToken;

  int? _passwordChangeExpiresIn;
  int? get passwordChangeExpiresIn => _$this._passwordChangeExpiresIn;
  set passwordChangeExpiresIn(int? passwordChangeExpiresIn) =>
      _$this._passwordChangeExpiresIn = passwordChangeExpiresIn;

  PasswordChangeChallengeResponseBuilder() {
    PasswordChangeChallengeResponse._defaults(this);
  }

  PasswordChangeChallengeResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _passwordChangeRequired = $v.passwordChangeRequired;
      _passwordChangeToken = $v.passwordChangeToken;
      _passwordChangeExpiresIn = $v.passwordChangeExpiresIn;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PasswordChangeChallengeResponse other) {
    _$v = other as _$PasswordChangeChallengeResponse;
  }

  @override
  void update(void Function(PasswordChangeChallengeResponseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PasswordChangeChallengeResponse build() => _build();

  _$PasswordChangeChallengeResponse _build() {
    final _$result = _$v ??
        _$PasswordChangeChallengeResponse._(
          passwordChangeRequired: BuiltValueNullFieldError.checkNotNull(
              passwordChangeRequired,
              r'PasswordChangeChallengeResponse',
              'passwordChangeRequired'),
          passwordChangeToken: BuiltValueNullFieldError.checkNotNull(
              passwordChangeToken,
              r'PasswordChangeChallengeResponse',
              'passwordChangeToken'),
          passwordChangeExpiresIn: BuiltValueNullFieldError.checkNotNull(
              passwordChangeExpiresIn,
              r'PasswordChangeChallengeResponse',
              'passwordChangeExpiresIn'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
