// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'refresh_web_session_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const RefreshWebSessionResponseAuthenticatedEnum
    _$refreshWebSessionResponseAuthenticatedEnum_true_ =
    const RefreshWebSessionResponseAuthenticatedEnum._('true_');

RefreshWebSessionResponseAuthenticatedEnum
    _$refreshWebSessionResponseAuthenticatedEnumValueOf(String name) {
  switch (name) {
    case 'true_':
      return _$refreshWebSessionResponseAuthenticatedEnum_true_;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RefreshWebSessionResponseAuthenticatedEnum>
    _$refreshWebSessionResponseAuthenticatedEnumValues = BuiltSet<
        RefreshWebSessionResponseAuthenticatedEnum>(const <RefreshWebSessionResponseAuthenticatedEnum>[
  _$refreshWebSessionResponseAuthenticatedEnum_true_,
]);

const RefreshWebSessionResponseScopeEnum
    _$refreshWebSessionResponseScopeEnum_passenger =
    const RefreshWebSessionResponseScopeEnum._('passenger');
const RefreshWebSessionResponseScopeEnum
    _$refreshWebSessionResponseScopeEnum_operator_ =
    const RefreshWebSessionResponseScopeEnum._('operator_');
const RefreshWebSessionResponseScopeEnum
    _$refreshWebSessionResponseScopeEnum_platform =
    const RefreshWebSessionResponseScopeEnum._('platform');

RefreshWebSessionResponseScopeEnum _$refreshWebSessionResponseScopeEnumValueOf(
    String name) {
  switch (name) {
    case 'passenger':
      return _$refreshWebSessionResponseScopeEnum_passenger;
    case 'operator_':
      return _$refreshWebSessionResponseScopeEnum_operator_;
    case 'platform':
      return _$refreshWebSessionResponseScopeEnum_platform;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RefreshWebSessionResponseScopeEnum>
    _$refreshWebSessionResponseScopeEnumValues = BuiltSet<
        RefreshWebSessionResponseScopeEnum>(const <RefreshWebSessionResponseScopeEnum>[
  _$refreshWebSessionResponseScopeEnum_passenger,
  _$refreshWebSessionResponseScopeEnum_operator_,
  _$refreshWebSessionResponseScopeEnum_platform,
]);

Serializer<RefreshWebSessionResponseAuthenticatedEnum>
    _$refreshWebSessionResponseAuthenticatedEnumSerializer =
    _$RefreshWebSessionResponseAuthenticatedEnumSerializer();
Serializer<RefreshWebSessionResponseScopeEnum>
    _$refreshWebSessionResponseScopeEnumSerializer =
    _$RefreshWebSessionResponseScopeEnumSerializer();

class _$RefreshWebSessionResponseAuthenticatedEnumSerializer
    implements PrimitiveSerializer<RefreshWebSessionResponseAuthenticatedEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'true_': 'true',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'true': 'true_',
  };

  @override
  final Iterable<Type> types = const <Type>[
    RefreshWebSessionResponseAuthenticatedEnum
  ];
  @override
  final String wireName = 'RefreshWebSessionResponseAuthenticatedEnum';

  @override
  Object serialize(Serializers serializers,
          RefreshWebSessionResponseAuthenticatedEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  RefreshWebSessionResponseAuthenticatedEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      RefreshWebSessionResponseAuthenticatedEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$RefreshWebSessionResponseScopeEnumSerializer
    implements PrimitiveSerializer<RefreshWebSessionResponseScopeEnum> {
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
  final Iterable<Type> types = const <Type>[RefreshWebSessionResponseScopeEnum];
  @override
  final String wireName = 'RefreshWebSessionResponseScopeEnum';

  @override
  Object serialize(
          Serializers serializers, RefreshWebSessionResponseScopeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  RefreshWebSessionResponseScopeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      RefreshWebSessionResponseScopeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$RefreshWebSessionResponse extends RefreshWebSessionResponse {
  @override
  final RefreshWebSessionResponseAuthenticatedEnum authenticated;
  @override
  final RefreshWebSessionResponseScopeEnum scope;
  @override
  final String role;
  @override
  final int expiresIn;
  @override
  final int refreshExpiresIn;

  factory _$RefreshWebSessionResponse(
          [void Function(RefreshWebSessionResponseBuilder)? updates]) =>
      (RefreshWebSessionResponseBuilder()..update(updates))._build();

  _$RefreshWebSessionResponse._(
      {required this.authenticated,
      required this.scope,
      required this.role,
      required this.expiresIn,
      required this.refreshExpiresIn})
      : super._();
  @override
  RefreshWebSessionResponse rebuild(
          void Function(RefreshWebSessionResponseBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RefreshWebSessionResponseBuilder toBuilder() =>
      RefreshWebSessionResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RefreshWebSessionResponse &&
        authenticated == other.authenticated &&
        scope == other.scope &&
        role == other.role &&
        expiresIn == other.expiresIn &&
        refreshExpiresIn == other.refreshExpiresIn;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, authenticated.hashCode);
    _$hash = $jc(_$hash, scope.hashCode);
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, expiresIn.hashCode);
    _$hash = $jc(_$hash, refreshExpiresIn.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RefreshWebSessionResponse')
          ..add('authenticated', authenticated)
          ..add('scope', scope)
          ..add('role', role)
          ..add('expiresIn', expiresIn)
          ..add('refreshExpiresIn', refreshExpiresIn))
        .toString();
  }
}

class RefreshWebSessionResponseBuilder
    implements
        Builder<RefreshWebSessionResponse, RefreshWebSessionResponseBuilder> {
  _$RefreshWebSessionResponse? _$v;

  RefreshWebSessionResponseAuthenticatedEnum? _authenticated;
  RefreshWebSessionResponseAuthenticatedEnum? get authenticated =>
      _$this._authenticated;
  set authenticated(
          RefreshWebSessionResponseAuthenticatedEnum? authenticated) =>
      _$this._authenticated = authenticated;

  RefreshWebSessionResponseScopeEnum? _scope;
  RefreshWebSessionResponseScopeEnum? get scope => _$this._scope;
  set scope(RefreshWebSessionResponseScopeEnum? scope) => _$this._scope = scope;

  String? _role;
  String? get role => _$this._role;
  set role(String? role) => _$this._role = role;

  int? _expiresIn;
  int? get expiresIn => _$this._expiresIn;
  set expiresIn(int? expiresIn) => _$this._expiresIn = expiresIn;

  int? _refreshExpiresIn;
  int? get refreshExpiresIn => _$this._refreshExpiresIn;
  set refreshExpiresIn(int? refreshExpiresIn) =>
      _$this._refreshExpiresIn = refreshExpiresIn;

  RefreshWebSessionResponseBuilder() {
    RefreshWebSessionResponse._defaults(this);
  }

  RefreshWebSessionResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _authenticated = $v.authenticated;
      _scope = $v.scope;
      _role = $v.role;
      _expiresIn = $v.expiresIn;
      _refreshExpiresIn = $v.refreshExpiresIn;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RefreshWebSessionResponse other) {
    _$v = other as _$RefreshWebSessionResponse;
  }

  @override
  void update(void Function(RefreshWebSessionResponseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RefreshWebSessionResponse build() => _build();

  _$RefreshWebSessionResponse _build() {
    final _$result = _$v ??
        _$RefreshWebSessionResponse._(
          authenticated: BuiltValueNullFieldError.checkNotNull(
              authenticated, r'RefreshWebSessionResponse', 'authenticated'),
          scope: BuiltValueNullFieldError.checkNotNull(
              scope, r'RefreshWebSessionResponse', 'scope'),
          role: BuiltValueNullFieldError.checkNotNull(
              role, r'RefreshWebSessionResponse', 'role'),
          expiresIn: BuiltValueNullFieldError.checkNotNull(
              expiresIn, r'RefreshWebSessionResponse', 'expiresIn'),
          refreshExpiresIn: BuiltValueNullFieldError.checkNotNull(
              refreshExpiresIn,
              r'RefreshWebSessionResponse',
              'refreshExpiresIn'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
