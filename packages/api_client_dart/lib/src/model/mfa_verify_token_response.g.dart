// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mfa_verify_token_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const MfaVerifyTokenResponseTokenTypeEnum
    _$mfaVerifyTokenResponseTokenTypeEnum_bearer =
    const MfaVerifyTokenResponseTokenTypeEnum._('bearer');

MfaVerifyTokenResponseTokenTypeEnum
    _$mfaVerifyTokenResponseTokenTypeEnumValueOf(String name) {
  switch (name) {
    case 'bearer':
      return _$mfaVerifyTokenResponseTokenTypeEnum_bearer;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MfaVerifyTokenResponseTokenTypeEnum>
    _$mfaVerifyTokenResponseTokenTypeEnumValues = BuiltSet<
        MfaVerifyTokenResponseTokenTypeEnum>(const <MfaVerifyTokenResponseTokenTypeEnum>[
  _$mfaVerifyTokenResponseTokenTypeEnum_bearer,
]);

const MfaVerifyTokenResponseScopeEnum
    _$mfaVerifyTokenResponseScopeEnum_passenger =
    const MfaVerifyTokenResponseScopeEnum._('passenger');
const MfaVerifyTokenResponseScopeEnum
    _$mfaVerifyTokenResponseScopeEnum_operator_ =
    const MfaVerifyTokenResponseScopeEnum._('operator_');
const MfaVerifyTokenResponseScopeEnum
    _$mfaVerifyTokenResponseScopeEnum_platform =
    const MfaVerifyTokenResponseScopeEnum._('platform');

MfaVerifyTokenResponseScopeEnum _$mfaVerifyTokenResponseScopeEnumValueOf(
    String name) {
  switch (name) {
    case 'passenger':
      return _$mfaVerifyTokenResponseScopeEnum_passenger;
    case 'operator_':
      return _$mfaVerifyTokenResponseScopeEnum_operator_;
    case 'platform':
      return _$mfaVerifyTokenResponseScopeEnum_platform;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MfaVerifyTokenResponseScopeEnum>
    _$mfaVerifyTokenResponseScopeEnumValues = BuiltSet<
        MfaVerifyTokenResponseScopeEnum>(const <MfaVerifyTokenResponseScopeEnum>[
  _$mfaVerifyTokenResponseScopeEnum_passenger,
  _$mfaVerifyTokenResponseScopeEnum_operator_,
  _$mfaVerifyTokenResponseScopeEnum_platform,
]);

const MfaVerifyTokenResponseMfaRequiredEnum
    _$mfaVerifyTokenResponseMfaRequiredEnum_false_ =
    const MfaVerifyTokenResponseMfaRequiredEnum._('false_');

MfaVerifyTokenResponseMfaRequiredEnum
    _$mfaVerifyTokenResponseMfaRequiredEnumValueOf(String name) {
  switch (name) {
    case 'false_':
      return _$mfaVerifyTokenResponseMfaRequiredEnum_false_;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MfaVerifyTokenResponseMfaRequiredEnum>
    _$mfaVerifyTokenResponseMfaRequiredEnumValues = BuiltSet<
        MfaVerifyTokenResponseMfaRequiredEnum>(const <MfaVerifyTokenResponseMfaRequiredEnum>[
  _$mfaVerifyTokenResponseMfaRequiredEnum_false_,
]);

Serializer<MfaVerifyTokenResponseTokenTypeEnum>
    _$mfaVerifyTokenResponseTokenTypeEnumSerializer =
    _$MfaVerifyTokenResponseTokenTypeEnumSerializer();
Serializer<MfaVerifyTokenResponseScopeEnum>
    _$mfaVerifyTokenResponseScopeEnumSerializer =
    _$MfaVerifyTokenResponseScopeEnumSerializer();
Serializer<MfaVerifyTokenResponseMfaRequiredEnum>
    _$mfaVerifyTokenResponseMfaRequiredEnumSerializer =
    _$MfaVerifyTokenResponseMfaRequiredEnumSerializer();

class _$MfaVerifyTokenResponseTokenTypeEnumSerializer
    implements PrimitiveSerializer<MfaVerifyTokenResponseTokenTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'bearer': 'Bearer',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'Bearer': 'bearer',
  };

  @override
  final Iterable<Type> types = const <Type>[
    MfaVerifyTokenResponseTokenTypeEnum
  ];
  @override
  final String wireName = 'MfaVerifyTokenResponseTokenTypeEnum';

  @override
  Object serialize(
          Serializers serializers, MfaVerifyTokenResponseTokenTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  MfaVerifyTokenResponseTokenTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      MfaVerifyTokenResponseTokenTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$MfaVerifyTokenResponseScopeEnumSerializer
    implements PrimitiveSerializer<MfaVerifyTokenResponseScopeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'passenger': 'passenger',
    'operator_': 'operator',
    'platform': 'platform',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'passenger': 'passenger',
    'operator': 'operator_',
    'platform': 'platform',
  };

  @override
  final Iterable<Type> types = const <Type>[MfaVerifyTokenResponseScopeEnum];
  @override
  final String wireName = 'MfaVerifyTokenResponseScopeEnum';

  @override
  Object serialize(
          Serializers serializers, MfaVerifyTokenResponseScopeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  MfaVerifyTokenResponseScopeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      MfaVerifyTokenResponseScopeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$MfaVerifyTokenResponseMfaRequiredEnumSerializer
    implements PrimitiveSerializer<MfaVerifyTokenResponseMfaRequiredEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'false_': 'false',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'false': 'false_',
  };

  @override
  final Iterable<Type> types = const <Type>[
    MfaVerifyTokenResponseMfaRequiredEnum
  ];
  @override
  final String wireName = 'MfaVerifyTokenResponseMfaRequiredEnum';

  @override
  Object serialize(
          Serializers serializers, MfaVerifyTokenResponseMfaRequiredEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  MfaVerifyTokenResponseMfaRequiredEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      MfaVerifyTokenResponseMfaRequiredEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$MfaVerifyTokenResponse extends MfaVerifyTokenResponse {
  @override
  final String accessToken;
  @override
  final MfaVerifyTokenResponseTokenTypeEnum tokenType;
  @override
  final int expiresIn;
  @override
  final MfaVerifyTokenResponseScopeEnum scope;
  @override
  final String role;
  @override
  final String refreshToken;
  @override
  final int refreshExpiresIn;
  @override
  final MfaVerifyTokenResponseMfaRequiredEnum mfaRequired;
  @override
  final BuiltList<String>? backupCodes;

  factory _$MfaVerifyTokenResponse(
          [void Function(MfaVerifyTokenResponseBuilder)? updates]) =>
      (MfaVerifyTokenResponseBuilder()..update(updates))._build();

  _$MfaVerifyTokenResponse._(
      {required this.accessToken,
      required this.tokenType,
      required this.expiresIn,
      required this.scope,
      required this.role,
      required this.refreshToken,
      required this.refreshExpiresIn,
      required this.mfaRequired,
      this.backupCodes})
      : super._();
  @override
  MfaVerifyTokenResponse rebuild(
          void Function(MfaVerifyTokenResponseBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  MfaVerifyTokenResponseBuilder toBuilder() =>
      MfaVerifyTokenResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MfaVerifyTokenResponse &&
        accessToken == other.accessToken &&
        tokenType == other.tokenType &&
        expiresIn == other.expiresIn &&
        scope == other.scope &&
        role == other.role &&
        refreshToken == other.refreshToken &&
        refreshExpiresIn == other.refreshExpiresIn &&
        mfaRequired == other.mfaRequired &&
        backupCodes == other.backupCodes;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, accessToken.hashCode);
    _$hash = $jc(_$hash, tokenType.hashCode);
    _$hash = $jc(_$hash, expiresIn.hashCode);
    _$hash = $jc(_$hash, scope.hashCode);
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, refreshToken.hashCode);
    _$hash = $jc(_$hash, refreshExpiresIn.hashCode);
    _$hash = $jc(_$hash, mfaRequired.hashCode);
    _$hash = $jc(_$hash, backupCodes.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MfaVerifyTokenResponse')
          ..add('accessToken', accessToken)
          ..add('tokenType', tokenType)
          ..add('expiresIn', expiresIn)
          ..add('scope', scope)
          ..add('role', role)
          ..add('refreshToken', refreshToken)
          ..add('refreshExpiresIn', refreshExpiresIn)
          ..add('mfaRequired', mfaRequired)
          ..add('backupCodes', backupCodes))
        .toString();
  }
}

class MfaVerifyTokenResponseBuilder
    implements Builder<MfaVerifyTokenResponse, MfaVerifyTokenResponseBuilder> {
  _$MfaVerifyTokenResponse? _$v;

  String? _accessToken;
  String? get accessToken => _$this._accessToken;
  set accessToken(String? accessToken) => _$this._accessToken = accessToken;

  MfaVerifyTokenResponseTokenTypeEnum? _tokenType;
  MfaVerifyTokenResponseTokenTypeEnum? get tokenType => _$this._tokenType;
  set tokenType(MfaVerifyTokenResponseTokenTypeEnum? tokenType) =>
      _$this._tokenType = tokenType;

  int? _expiresIn;
  int? get expiresIn => _$this._expiresIn;
  set expiresIn(int? expiresIn) => _$this._expiresIn = expiresIn;

  MfaVerifyTokenResponseScopeEnum? _scope;
  MfaVerifyTokenResponseScopeEnum? get scope => _$this._scope;
  set scope(MfaVerifyTokenResponseScopeEnum? scope) => _$this._scope = scope;

  String? _role;
  String? get role => _$this._role;
  set role(String? role) => _$this._role = role;

  String? _refreshToken;
  String? get refreshToken => _$this._refreshToken;
  set refreshToken(String? refreshToken) => _$this._refreshToken = refreshToken;

  int? _refreshExpiresIn;
  int? get refreshExpiresIn => _$this._refreshExpiresIn;
  set refreshExpiresIn(int? refreshExpiresIn) =>
      _$this._refreshExpiresIn = refreshExpiresIn;

  MfaVerifyTokenResponseMfaRequiredEnum? _mfaRequired;
  MfaVerifyTokenResponseMfaRequiredEnum? get mfaRequired => _$this._mfaRequired;
  set mfaRequired(MfaVerifyTokenResponseMfaRequiredEnum? mfaRequired) =>
      _$this._mfaRequired = mfaRequired;

  ListBuilder<String>? _backupCodes;
  ListBuilder<String> get backupCodes =>
      _$this._backupCodes ??= ListBuilder<String>();
  set backupCodes(ListBuilder<String>? backupCodes) =>
      _$this._backupCodes = backupCodes;

  MfaVerifyTokenResponseBuilder() {
    MfaVerifyTokenResponse._defaults(this);
  }

  MfaVerifyTokenResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _accessToken = $v.accessToken;
      _tokenType = $v.tokenType;
      _expiresIn = $v.expiresIn;
      _scope = $v.scope;
      _role = $v.role;
      _refreshToken = $v.refreshToken;
      _refreshExpiresIn = $v.refreshExpiresIn;
      _mfaRequired = $v.mfaRequired;
      _backupCodes = $v.backupCodes?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MfaVerifyTokenResponse other) {
    _$v = other as _$MfaVerifyTokenResponse;
  }

  @override
  void update(void Function(MfaVerifyTokenResponseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MfaVerifyTokenResponse build() => _build();

  _$MfaVerifyTokenResponse _build() {
    _$MfaVerifyTokenResponse _$result;
    try {
      _$result = _$v ??
          _$MfaVerifyTokenResponse._(
            accessToken: BuiltValueNullFieldError.checkNotNull(
                accessToken, r'MfaVerifyTokenResponse', 'accessToken'),
            tokenType: BuiltValueNullFieldError.checkNotNull(
                tokenType, r'MfaVerifyTokenResponse', 'tokenType'),
            expiresIn: BuiltValueNullFieldError.checkNotNull(
                expiresIn, r'MfaVerifyTokenResponse', 'expiresIn'),
            scope: BuiltValueNullFieldError.checkNotNull(
                scope, r'MfaVerifyTokenResponse', 'scope'),
            role: BuiltValueNullFieldError.checkNotNull(
                role, r'MfaVerifyTokenResponse', 'role'),
            refreshToken: BuiltValueNullFieldError.checkNotNull(
                refreshToken, r'MfaVerifyTokenResponse', 'refreshToken'),
            refreshExpiresIn: BuiltValueNullFieldError.checkNotNull(
                refreshExpiresIn,
                r'MfaVerifyTokenResponse',
                'refreshExpiresIn'),
            mfaRequired: BuiltValueNullFieldError.checkNotNull(
                mfaRequired, r'MfaVerifyTokenResponse', 'mfaRequired'),
            backupCodes: _backupCodes?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'backupCodes';
        _backupCodes?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'MfaVerifyTokenResponse', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
