// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'refresh_token_pair_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const RefreshTokenPairResponseTokenTypeEnum
    _$refreshTokenPairResponseTokenTypeEnum_bearer =
    const RefreshTokenPairResponseTokenTypeEnum._('bearer');

RefreshTokenPairResponseTokenTypeEnum
    _$refreshTokenPairResponseTokenTypeEnumValueOf(String name) {
  switch (name) {
    case 'bearer':
      return _$refreshTokenPairResponseTokenTypeEnum_bearer;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RefreshTokenPairResponseTokenTypeEnum>
    _$refreshTokenPairResponseTokenTypeEnumValues = BuiltSet<
        RefreshTokenPairResponseTokenTypeEnum>(const <RefreshTokenPairResponseTokenTypeEnum>[
  _$refreshTokenPairResponseTokenTypeEnum_bearer,
]);

const RefreshTokenPairResponseScopeEnum
    _$refreshTokenPairResponseScopeEnum_passenger =
    const RefreshTokenPairResponseScopeEnum._('passenger');
const RefreshTokenPairResponseScopeEnum
    _$refreshTokenPairResponseScopeEnum_operator_ =
    const RefreshTokenPairResponseScopeEnum._('operator_');
const RefreshTokenPairResponseScopeEnum
    _$refreshTokenPairResponseScopeEnum_platform =
    const RefreshTokenPairResponseScopeEnum._('platform');

RefreshTokenPairResponseScopeEnum _$refreshTokenPairResponseScopeEnumValueOf(
    String name) {
  switch (name) {
    case 'passenger':
      return _$refreshTokenPairResponseScopeEnum_passenger;
    case 'operator_':
      return _$refreshTokenPairResponseScopeEnum_operator_;
    case 'platform':
      return _$refreshTokenPairResponseScopeEnum_platform;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RefreshTokenPairResponseScopeEnum>
    _$refreshTokenPairResponseScopeEnumValues = BuiltSet<
        RefreshTokenPairResponseScopeEnum>(const <RefreshTokenPairResponseScopeEnum>[
  _$refreshTokenPairResponseScopeEnum_passenger,
  _$refreshTokenPairResponseScopeEnum_operator_,
  _$refreshTokenPairResponseScopeEnum_platform,
]);

Serializer<RefreshTokenPairResponseTokenTypeEnum>
    _$refreshTokenPairResponseTokenTypeEnumSerializer =
    _$RefreshTokenPairResponseTokenTypeEnumSerializer();
Serializer<RefreshTokenPairResponseScopeEnum>
    _$refreshTokenPairResponseScopeEnumSerializer =
    _$RefreshTokenPairResponseScopeEnumSerializer();

class _$RefreshTokenPairResponseTokenTypeEnumSerializer
    implements PrimitiveSerializer<RefreshTokenPairResponseTokenTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'bearer': 'Bearer',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'Bearer': 'bearer',
  };

  @override
  final Iterable<Type> types = const <Type>[
    RefreshTokenPairResponseTokenTypeEnum
  ];
  @override
  final String wireName = 'RefreshTokenPairResponseTokenTypeEnum';

  @override
  Object serialize(
          Serializers serializers, RefreshTokenPairResponseTokenTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  RefreshTokenPairResponseTokenTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      RefreshTokenPairResponseTokenTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$RefreshTokenPairResponseScopeEnumSerializer
    implements PrimitiveSerializer<RefreshTokenPairResponseScopeEnum> {
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
  final Iterable<Type> types = const <Type>[RefreshTokenPairResponseScopeEnum];
  @override
  final String wireName = 'RefreshTokenPairResponseScopeEnum';

  @override
  Object serialize(
          Serializers serializers, RefreshTokenPairResponseScopeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  RefreshTokenPairResponseScopeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      RefreshTokenPairResponseScopeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$RefreshTokenPairResponse extends RefreshTokenPairResponse {
  @override
  final String accessToken;
  @override
  final RefreshTokenPairResponseTokenTypeEnum tokenType;
  @override
  final int expiresIn;
  @override
  final RefreshTokenPairResponseScopeEnum scope;
  @override
  final String role;
  @override
  final String refreshToken;
  @override
  final int refreshExpiresIn;

  factory _$RefreshTokenPairResponse(
          [void Function(RefreshTokenPairResponseBuilder)? updates]) =>
      (RefreshTokenPairResponseBuilder()..update(updates))._build();

  _$RefreshTokenPairResponse._(
      {required this.accessToken,
      required this.tokenType,
      required this.expiresIn,
      required this.scope,
      required this.role,
      required this.refreshToken,
      required this.refreshExpiresIn})
      : super._();
  @override
  RefreshTokenPairResponse rebuild(
          void Function(RefreshTokenPairResponseBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RefreshTokenPairResponseBuilder toBuilder() =>
      RefreshTokenPairResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RefreshTokenPairResponse &&
        accessToken == other.accessToken &&
        tokenType == other.tokenType &&
        expiresIn == other.expiresIn &&
        scope == other.scope &&
        role == other.role &&
        refreshToken == other.refreshToken &&
        refreshExpiresIn == other.refreshExpiresIn;
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
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RefreshTokenPairResponse')
          ..add('accessToken', accessToken)
          ..add('tokenType', tokenType)
          ..add('expiresIn', expiresIn)
          ..add('scope', scope)
          ..add('role', role)
          ..add('refreshToken', refreshToken)
          ..add('refreshExpiresIn', refreshExpiresIn))
        .toString();
  }
}

class RefreshTokenPairResponseBuilder
    implements
        Builder<RefreshTokenPairResponse, RefreshTokenPairResponseBuilder> {
  _$RefreshTokenPairResponse? _$v;

  String? _accessToken;
  String? get accessToken => _$this._accessToken;
  set accessToken(String? accessToken) => _$this._accessToken = accessToken;

  RefreshTokenPairResponseTokenTypeEnum? _tokenType;
  RefreshTokenPairResponseTokenTypeEnum? get tokenType => _$this._tokenType;
  set tokenType(RefreshTokenPairResponseTokenTypeEnum? tokenType) =>
      _$this._tokenType = tokenType;

  int? _expiresIn;
  int? get expiresIn => _$this._expiresIn;
  set expiresIn(int? expiresIn) => _$this._expiresIn = expiresIn;

  RefreshTokenPairResponseScopeEnum? _scope;
  RefreshTokenPairResponseScopeEnum? get scope => _$this._scope;
  set scope(RefreshTokenPairResponseScopeEnum? scope) => _$this._scope = scope;

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

  RefreshTokenPairResponseBuilder() {
    RefreshTokenPairResponse._defaults(this);
  }

  RefreshTokenPairResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _accessToken = $v.accessToken;
      _tokenType = $v.tokenType;
      _expiresIn = $v.expiresIn;
      _scope = $v.scope;
      _role = $v.role;
      _refreshToken = $v.refreshToken;
      _refreshExpiresIn = $v.refreshExpiresIn;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RefreshTokenPairResponse other) {
    _$v = other as _$RefreshTokenPairResponse;
  }

  @override
  void update(void Function(RefreshTokenPairResponseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RefreshTokenPairResponse build() => _build();

  _$RefreshTokenPairResponse _build() {
    final _$result = _$v ??
        _$RefreshTokenPairResponse._(
          accessToken: BuiltValueNullFieldError.checkNotNull(
              accessToken, r'RefreshTokenPairResponse', 'accessToken'),
          tokenType: BuiltValueNullFieldError.checkNotNull(
              tokenType, r'RefreshTokenPairResponse', 'tokenType'),
          expiresIn: BuiltValueNullFieldError.checkNotNull(
              expiresIn, r'RefreshTokenPairResponse', 'expiresIn'),
          scope: BuiltValueNullFieldError.checkNotNull(
              scope, r'RefreshTokenPairResponse', 'scope'),
          role: BuiltValueNullFieldError.checkNotNull(
              role, r'RefreshTokenPairResponse', 'role'),
          refreshToken: BuiltValueNullFieldError.checkNotNull(
              refreshToken, r'RefreshTokenPairResponse', 'refreshToken'),
          refreshExpiresIn: BuiltValueNullFieldError.checkNotNull(
              refreshExpiresIn,
              r'RefreshTokenPairResponse',
              'refreshExpiresIn'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
