// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'credential_web_session_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CredentialWebSessionResponseAuthenticatedEnum
    _$credentialWebSessionResponseAuthenticatedEnum_true_ =
    const CredentialWebSessionResponseAuthenticatedEnum._('true_');

CredentialWebSessionResponseAuthenticatedEnum
    _$credentialWebSessionResponseAuthenticatedEnumValueOf(String name) {
  switch (name) {
    case 'true_':
      return _$credentialWebSessionResponseAuthenticatedEnum_true_;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CredentialWebSessionResponseAuthenticatedEnum>
    _$credentialWebSessionResponseAuthenticatedEnumValues = BuiltSet<
        CredentialWebSessionResponseAuthenticatedEnum>(const <CredentialWebSessionResponseAuthenticatedEnum>[
  _$credentialWebSessionResponseAuthenticatedEnum_true_,
]);

const CredentialWebSessionResponseScopeEnum
    _$credentialWebSessionResponseScopeEnum_passenger =
    const CredentialWebSessionResponseScopeEnum._('passenger');
const CredentialWebSessionResponseScopeEnum
    _$credentialWebSessionResponseScopeEnum_operator_ =
    const CredentialWebSessionResponseScopeEnum._('operator_');
const CredentialWebSessionResponseScopeEnum
    _$credentialWebSessionResponseScopeEnum_platform =
    const CredentialWebSessionResponseScopeEnum._('platform');

CredentialWebSessionResponseScopeEnum
    _$credentialWebSessionResponseScopeEnumValueOf(String name) {
  switch (name) {
    case 'passenger':
      return _$credentialWebSessionResponseScopeEnum_passenger;
    case 'operator_':
      return _$credentialWebSessionResponseScopeEnum_operator_;
    case 'platform':
      return _$credentialWebSessionResponseScopeEnum_platform;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CredentialWebSessionResponseScopeEnum>
    _$credentialWebSessionResponseScopeEnumValues = BuiltSet<
        CredentialWebSessionResponseScopeEnum>(const <CredentialWebSessionResponseScopeEnum>[
  _$credentialWebSessionResponseScopeEnum_passenger,
  _$credentialWebSessionResponseScopeEnum_operator_,
  _$credentialWebSessionResponseScopeEnum_platform,
]);

Serializer<CredentialWebSessionResponseAuthenticatedEnum>
    _$credentialWebSessionResponseAuthenticatedEnumSerializer =
    _$CredentialWebSessionResponseAuthenticatedEnumSerializer();
Serializer<CredentialWebSessionResponseScopeEnum>
    _$credentialWebSessionResponseScopeEnumSerializer =
    _$CredentialWebSessionResponseScopeEnumSerializer();

class _$CredentialWebSessionResponseAuthenticatedEnumSerializer
    implements
        PrimitiveSerializer<CredentialWebSessionResponseAuthenticatedEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'true_': 'true',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'true': 'true_',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CredentialWebSessionResponseAuthenticatedEnum
  ];
  @override
  final String wireName = 'CredentialWebSessionResponseAuthenticatedEnum';

  @override
  Object serialize(Serializers serializers,
          CredentialWebSessionResponseAuthenticatedEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  CredentialWebSessionResponseAuthenticatedEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      CredentialWebSessionResponseAuthenticatedEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$CredentialWebSessionResponseScopeEnumSerializer
    implements PrimitiveSerializer<CredentialWebSessionResponseScopeEnum> {
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
  final Iterable<Type> types = const <Type>[
    CredentialWebSessionResponseScopeEnum
  ];
  @override
  final String wireName = 'CredentialWebSessionResponseScopeEnum';

  @override
  Object serialize(
          Serializers serializers, CredentialWebSessionResponseScopeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  CredentialWebSessionResponseScopeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      CredentialWebSessionResponseScopeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$CredentialWebSessionResponse extends CredentialWebSessionResponse {
  @override
  final CredentialWebSessionResponseAuthenticatedEnum authenticated;
  @override
  final CredentialWebSessionResponseScopeEnum scope;
  @override
  final String role;
  @override
  final int expiresIn;
  @override
  final int refreshExpiresIn;

  factory _$CredentialWebSessionResponse(
          [void Function(CredentialWebSessionResponseBuilder)? updates]) =>
      (CredentialWebSessionResponseBuilder()..update(updates))._build();

  _$CredentialWebSessionResponse._(
      {required this.authenticated,
      required this.scope,
      required this.role,
      required this.expiresIn,
      required this.refreshExpiresIn})
      : super._();
  @override
  CredentialWebSessionResponse rebuild(
          void Function(CredentialWebSessionResponseBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CredentialWebSessionResponseBuilder toBuilder() =>
      CredentialWebSessionResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CredentialWebSessionResponse &&
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
    return (newBuiltValueToStringHelper(r'CredentialWebSessionResponse')
          ..add('authenticated', authenticated)
          ..add('scope', scope)
          ..add('role', role)
          ..add('expiresIn', expiresIn)
          ..add('refreshExpiresIn', refreshExpiresIn))
        .toString();
  }
}

class CredentialWebSessionResponseBuilder
    implements
        Builder<CredentialWebSessionResponse,
            CredentialWebSessionResponseBuilder> {
  _$CredentialWebSessionResponse? _$v;

  CredentialWebSessionResponseAuthenticatedEnum? _authenticated;
  CredentialWebSessionResponseAuthenticatedEnum? get authenticated =>
      _$this._authenticated;
  set authenticated(
          CredentialWebSessionResponseAuthenticatedEnum? authenticated) =>
      _$this._authenticated = authenticated;

  CredentialWebSessionResponseScopeEnum? _scope;
  CredentialWebSessionResponseScopeEnum? get scope => _$this._scope;
  set scope(CredentialWebSessionResponseScopeEnum? scope) =>
      _$this._scope = scope;

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

  CredentialWebSessionResponseBuilder() {
    CredentialWebSessionResponse._defaults(this);
  }

  CredentialWebSessionResponseBuilder get _$this {
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
  void replace(CredentialWebSessionResponse other) {
    _$v = other as _$CredentialWebSessionResponse;
  }

  @override
  void update(void Function(CredentialWebSessionResponseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CredentialWebSessionResponse build() => _build();

  _$CredentialWebSessionResponse _build() {
    final _$result = _$v ??
        _$CredentialWebSessionResponse._(
          authenticated: BuiltValueNullFieldError.checkNotNull(
              authenticated, r'CredentialWebSessionResponse', 'authenticated'),
          scope: BuiltValueNullFieldError.checkNotNull(
              scope, r'CredentialWebSessionResponse', 'scope'),
          role: BuiltValueNullFieldError.checkNotNull(
              role, r'CredentialWebSessionResponse', 'role'),
          expiresIn: BuiltValueNullFieldError.checkNotNull(
              expiresIn, r'CredentialWebSessionResponse', 'expiresIn'),
          refreshExpiresIn: BuiltValueNullFieldError.checkNotNull(
              refreshExpiresIn,
              r'CredentialWebSessionResponse',
              'refreshExpiresIn'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
